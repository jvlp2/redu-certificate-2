import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlService } from './access-control.service';

async function initServiceWithHeaders(headers: Record<string, string>) {
  return Test.createTestingModule({
    providers: [
      AccessControlService,
      {
        provide: REQUEST,
        useValue: {
          headers,
        },
      },
    ],
  })
    .compile()
    .then((m: TestingModule) =>
      m.resolve<AccessControlService>(AccessControlService),
    )
    .catch(() => undefined);
}

describe('AccessControlService', () => {
  let service: AccessControlService;

  describe('Com X-Client-Name invalido', () => {
    beforeEach(async () => {
      service = (await initServiceWithHeaders({
        'x-client-name': 'invalid-client',
        authorization: '123',
      })) as AccessControlService;
    });

    it('should not be defined', () => {
      expect(service).toBeUndefined();
    });
  });

  describe('Com X-Client-Name invalido', () => {
    beforeEach(async () => {
      service = (await initServiceWithHeaders({
        'x-client-name': 'redu',
        authorization: '123',
      })) as AccessControlService;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
