import * as cheerio from 'cheerio';
import { Injectable } from '@nestjs/common';
import { Result, success, fail } from '@/common/result.common';
import { ScrapedPlayerDto } from '@/modules/admin/dtos/scraped-player.dto';
import { parsePlayerName } from '@modules/players/utils/parsePlayerName.util';
import { SELECTORS } from '../config/scraper-selectors.config';
import { BaseScraperRepository } from './base-scraper.repository';

@Injectable()
export class PlayerScraperRepository extends BaseScraperRepository {
  scrapePlayers(html: string): Result<ScrapedPlayerDto[], Error> {
    this.logger.log('Processing HTML to extract players data.');
    const players = [] as ScrapedPlayerDto[];

    try {
      const $ = cheerio.load(html);
      const playersElements = $(
        SELECTORS.PLAYERS.CONTAINER as cheerio.SelectorType,
      );

      if (playersElements.length === 0) {
        this.logger.warn(
          `No player elements found with the selector "${SELECTORS.PLAYERS.CONTAINER}".`,
        );

        return success([]);
      }

      playersElements.each((index, element) => {
        try {
          const $element = $(element);

          const playerName = this.extractContent(
            $element,
            SELECTORS.PLAYERS.NAME,
          ).getOrThrow(() => {
            this.logger.warn(
              `Missing required data for player element at index ${index}. Skipping.`,
            );

            return new Error(
              `Unable to extract player element at index ${index}.`,
            );
          });

          const { firstName, lastName, nickname } = parsePlayerName(playerName);

          const playerPosition = this.extractContent(
            $element,
            SELECTORS.PLAYERS.POSITION,
          ).getOrThrow(
            () =>
              new Error(`Unable to extract player position at index ${index}.`),
          );

          const playerImageUrl = this.extractAttribute(
            $element,
            SELECTORS.PLAYERS.IMAGE,
            'src',
          )
            .map((ipx) => `https://kingsleague.pro${ipx}`)
            .toNullable();

          const playerNumber = this.extractContent(
            $element,
            SELECTORS.PLAYERS.NUMBER,
          )
            .map((jersey) => jersey.substring(1))
            .map((jersey) => parseInt(jersey))
            .toNullable();

          const playerReference = this.extractAttribute(
            $element,
            SELECTORS.PLAYERS.LINK,
            'href',
          )
            .map((href) => href.split('/').pop() as string)
            .map((referenceUrl) => ({
              referenceUrl,
              referenceId: parseInt(String(referenceUrl.split('-').at(0))),
            }))
            .getOrThrow(() => new Error('Unable to extract player reference.'));

          const isPlayerWildCard = this.extractAttribute(
            $element,
            SELECTORS.PLAYERS.WILDCARD,
            'class',
          )
            .map((value) => !!value)
            .getOrElse(false);

          const scrapedPlayerDto = new ScrapedPlayerDto();
          scrapedPlayerDto.name = playerName;
          scrapedPlayerDto.firstName = firstName;
          scrapedPlayerDto.lastName = lastName;
          scrapedPlayerDto.position = playerPosition;
          scrapedPlayerDto.referenceId = playerReference.referenceId;
          scrapedPlayerDto.referenceUrl = playerReference.referenceUrl;
          scrapedPlayerDto.isWildCard = isPlayerWildCard;

          if (playerNumber) scrapedPlayerDto.jerseyNumber = playerNumber;
          if (playerImageUrl) scrapedPlayerDto.imageUrl = playerImageUrl;
          if (nickname) scrapedPlayerDto.nickname = nickname;
          scrapedPlayerDto.setUniqueSlug();

          players.push(scrapedPlayerDto);
        } catch (innerError) {
          const err =
            innerError instanceof Error
              ? innerError
              : new Error(
                  `Unknown error processing player element at index ${index}: ${innerError}`,
                );

          this.logger.error(
            `Error processing player element at index ${index}`,
            err.stack,
          );
        }
      });

      this.logger.verbose(`Successfully extracted ${players.length} players.`);

      return success(players);
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error(`Failed to process HTML: ${e}`);
      this.logger.error(`Error during HTML processing`, error.stack);

      return fail<ScrapedPlayerDto[], Error>(error);
    }
  }
}
