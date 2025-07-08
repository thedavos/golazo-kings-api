import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { Injectable, Logger } from '@nestjs/common';
import { Option, some, none } from '@common/maybe';

@Injectable()
export abstract class BaseScraperRepository {
  protected readonly logger = new Logger(this.constructor.name);

  protected extractContent(
    element: cheerio.Cheerio<Element>,
    selector: string,
  ): Option<string> {
    const selectedElement = element.find(selector);

    if (selectedElement.length > 0) {
      const text = selectedElement.first().text().trim();
      if (text.length > 0) {
        return some(text);
      }
    }

    return none<string>();
  }

  protected extractAttribute(
    element: cheerio.Cheerio<Element>,
    selector: string,
    attributeName: string,
  ): Option<string> {
    const selectedElement = element.find(selector);

    if (selectedElement.length === 0) {
      return none<string>();
    }

    const attributeValue = selectedElement.first().attr(attributeName);

    if (attributeValue && attributeValue.trim().length > 0) {
      return some(attributeValue.trim());
    }

    return none<string>();
  }
}
