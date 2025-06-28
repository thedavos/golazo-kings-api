import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '@modules/auth/decorators/public.decorator';

@ApiTags('Problem Documentation')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly configService: ConfigService) {}

  private readonly problemTypes = {
    'bad-request': {
      title: 'Bad Request',
      status: 400,
      description: 'The request was malformed or contained invalid parameters.',
      commonCauses: [
        'Missing required parameters',
        'Invalid parameter format',
        'Malformed JSON body',
        'Invalid query parameters',
      ],
      howToFix: [
        'Validate all request parameters',
        'Check JSON syntax',
        'Ensure all required fields are included',
        'Verify parameter types match expected format',
      ],
      example: {
        type: 'https://api.example.com/problems/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Missing required parameter: email',
        instance: '/api/users',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
    'authentication-required': {
      title: 'Authentication Required',
      status: 401,
      description:
        'Valid authentication credentials are required to access this resource.',
      commonCauses: [
        'Missing Authorization header',
        'Invalid or expired JWT token',
        'Malformed authentication credentials',
      ],
      howToFix: [
        'Include valid Authorization header',
        'Refresh expired tokens',
        'Verify token format (Bearer {token})',
      ],
      example: {
        type: 'https://api.example.com/problems/authentication-required',
        title: 'Unauthorized',
        status: 401,
        detail: 'JWT token is missing or invalid',
        instance: '/api/users/profile',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
    'access-denied': {
      title: 'Access Denied',
      status: 403,
      description:
        'You do not have sufficient permissions to access this resource.',
      commonCauses: [
        'Insufficient user privileges',
        'Resource access restrictions',
        'Role-based access control violation',
      ],
      howToFix: [
        'Contact administrator for access',
        'Verify your user role permissions',
        'Ensure you have the required privileges',
      ],
      example: {
        type: 'https://api.example.com/problems/access-denied',
        title: 'Forbidden',
        status: 403,
        detail: 'Admin privileges required to access this endpoint',
        instance: '/api/admin/users',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
    'resource-not-found': {
      title: 'Resource Not Found',
      status: 404,
      description: 'The requested resource could not be found.',
      commonCauses: [
        'Invalid resource ID',
        'Resource has been deleted',
        'Incorrect URL path',
      ],
      howToFix: [
        'Verify the resource ID exists',
        'Check the URL path for typos',
        'Ensure the resource has not been removed',
      ],
      example: {
        type: 'https://api.example.com/problems/resource-not-found',
        title: 'Not Found',
        status: 404,
        detail: 'User with ID 123 not found',
        instance: '/api/users/123',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
    'resource-conflict': {
      title: 'Resource Conflict',
      status: 409,
      description:
        'The request conflicts with the current state of the resource.',
      commonCauses: [
        'Duplicate resource creation',
        'Concurrent modification conflict',
        'Business rule violation',
      ],
      howToFix: [
        'Check if resource already exists',
        'Retry with updated data',
        'Resolve conflicting changes',
      ],
      example: {
        type: 'https://api.example.com/problems/resource-conflict',
        title: 'Conflict',
        status: 409,
        detail: 'Email address already exists',
        instance: '/api/users',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
    'validation-failed': {
      title: 'Validation Failed',
      status: 422,
      description: 'The request data failed validation rules.',
      commonCauses: [
        'Missing required fields',
        'Invalid field formats',
        'Data constraint violations',
        'Type mismatches',
      ],
      howToFix: [
        'Check the errors field in the response',
        'Validate all input data before sending',
        'Follow field format requirements',
        'Ensure all required fields are provided',
      ],
      example: {
        type: 'https://api.example.com/problems/validation-failed',
        title: 'Unprocessable Entity',
        status: 422,
        detail: 'Validation failed: email must be a valid email address',
        instance: '/api/users',
        timestamp: '2024-01-01T12:00:00Z',
        errors: [
          'email must be a valid email address',
          'password must be at least 8 characters',
        ],
      },
    },
    'rate-limit-exceeded': {
      title: 'Rate Limit Exceeded',
      status: 429,
      description: 'Too many requests have been sent in a given time frame.',
      commonCauses: [
        'Exceeded API rate limits',
        'Too many requests per minute/hour',
        'Burst limit exceeded',
      ],
      howToFix: [
        'Wait before making more requests',
        'Implement request throttling',
        'Check rate limit headers',
        'Consider upgrading your plan',
      ],
      example: {
        type: 'https://api.example.com/problems/rate-limit-exceeded',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Rate limit of 100 requests per minute exceeded',
        instance: '/api/users',
        timestamp: '2024-01-01T12:00:00Z',
        'retry-after': 60,
      },
    },
    'internal-server-error': {
      title: 'Internal Server Error',
      status: 500,
      description: 'An unexpected error occurred on the server.',
      commonCauses: [
        'Server-side programming errors',
        'Database connection issues',
        'External service failures',
        'Configuration problems',
      ],
      howToFix: [
        'Try the request again later',
        'Contact support if the problem persists',
        'Check system status page',
      ],
      example: {
        type: 'https://api.example.com/problems/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred while processing your request',
        instance: '/api/users',
        timestamp: '2024-01-01T12:00:00Z',
      },
    },
  };

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List all problem types',
    description:
      'Returns a list of all available problem types and their documentation',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all problem types',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        problems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  getAllProblems() {
    return {
      title: 'API Problem Types',
      description:
        'This endpoint provides documentation for all problem types that may be returned by the API',
      problems: Object.keys(this.problemTypes).map(
        (key: keyof typeof this.problemTypes) => ({
          type: `${this.getBaseUrl()}/problems/${key}`,
          title: this.problemTypes[key].title,
          status: this.problemTypes[key].status,
          description: this.problemTypes[key].description,
        }),
      ),
    };
  }

  @Public()
  @Get(':problemType')
  @ApiOperation({
    summary: 'Get specific problem type documentation',
    description: 'Returns detailed documentation for a specific problem type',
  })
  @ApiParam({
    name: 'problemType',
    description: 'The problem type identifier',
    example: 'validation-failed',
    enum: [
      'bad-request',
      'authentication-required',
      'access-denied',
      'resource-not-found',
      'resource-conflict',
      'validation-failed',
      'rate-limit-exceeded',
      'internal-server-error',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Problem type documentation',
    headers: {
      'Content-Type': {
        description: 'Content type',
        schema: { type: 'string', example: 'application/problem+json' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Problem type not found',
  })
  getProblemDetail(
    @Param('problemType') problemType: keyof typeof this.problemTypes,
  ) {
    const problem = this.problemTypes[problemType];

    if (!problem) {
      throw new NotFoundException(`Problem type '${problemType}' not found`);
    }

    return {
      type: `${this.getBaseUrl()}/problems/${problemType}`,
      ...problem,
      documentation: {
        relatedEndpoints: this.getRelatedEndpoints(problemType),
        moreInfo: `${this.getBaseUrl()}/api`,
      },
    };
  }

  private getBaseUrl(): string {
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    return isDevelopment
      ? 'http://localhost:3000'
      : 'https://api.golazokings.com';
  }

  private getRelatedEndpoints(problemType: string): string[] {
    const endpointMap: Record<string, string[]> = {
      'validation-failed': ['/users', '/auth/register', '/posts'],
      'authentication-required': ['/auth/login', '/auth/refresh'],
      'access-denied': ['/admin/*', '/users/*/admin-actions'],
      'resource-not-found': ['/users/:id', '/posts/:id'],
      'resource-conflict': ['/users', '/auth/register'],
      'rate-limit-exceeded': ['All endpoints'],
      'bad-request': ['All endpoints'],
      'internal-server-error': ['All endpoints'],
    };

    return endpointMap[problemType] || [];
  }
}
