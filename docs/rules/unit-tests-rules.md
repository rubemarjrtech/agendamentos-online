## Localização de testes unitários

Os testes devem estar, a princípio, no mesmo módulo (ou pasta) em que se encontra o arquivo a que testam. Ex.:

```
    backend/
        src/
            user/
                user.controller.ts
                user.controller.spec.ts
```

Arquivos de testes unitários possuem .spec.ts como sufixo.
O único caso em que não se deve seguir a estruturação acima é quando o usuário pedir.

Em caso de dúvida sobre estruturação, sempre perguntar ao usuário.

## Estruturação de testes unitários

Os testes devem usar a classe Test da biblioteca @nestjs/testing, o retorno deve ser do tipo TestingModule do mesmo módulo. Ex.:

```
    // dentro de um beforeAll
    const module: TestingModule = await Test.createTestingModule({
      imports: [// imports],
      controllers: [// controllers],
      providers: [// providers],
    }).compile();

    // resto do código
```

Os mocks devem ser feitos da seguinte forma, visando organização e facilidade de manutenção, seguindo o exemplo:

```
    let myMockService: jest.Mocked<MockService>;

    // dentro do mesmo beforeAll
    myMockService = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
```

e devem ser usados assim, seguindo o padrão do nestjs:

```
    const module: TestingModule = await Test.createTestingModule({
      imports: [// imports],
      controllers: [// controllers],
      providers: [{ provide: MockService, useValue: myMockService }],
    }).compile();
```

se estamos testando o arquivo booking.controller.ts, instanciamos o BookingController dessa forma:

```
    let bookingController: BookingController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [// imports],
            controllers: [BookingController],
            providers: [// providers],
        }).compile();

        bookingController = module.get<BookingController>(BookingController);
    });
```

Em alguns casos ou edge cases em objetos aninhados, um Service dentro de um Controller (exemplo) pode ter propriedades ou métodos que não serão importantes para os testes. Neste caso, evite usar Partial, para que na sequência não seja necessário utilizar o operador ! em chamadas de métodos dentro dos testes. Neste caso, usamos Pick para satisfazer os tipos. Ex.:

```
    let controller: SchedulingController;
    let mockSchedulingService: jest.Mocked<
        Pick<SchedulingService, 'checkAvailability' | 'acquireLock' | 'confirmAppointment'>
    >;
```

nesse caso, apenas os membros 'checkAvailability' | 'acquireLock' | 'confirmAppointment' da classe SchedulingService são importantes para os testes unitários de SchedulingController pois apenas fazemos mock do retorno, apenas os parâmetros e argumentos desses métodos são importantes, a implementação não.

Essas regras valem para todos arquivos de testes unitários.

## Regras para testes

# 1

Antes de escrever mocks de bibliotecas de terceiros, SEMPRE analise a assinatura do objeto/função/classe que está sofrendo o mock, e como ela está sendo utilizada no método real. Ex.:

```
    import { Request } from 'express';

    // como está sendo utilizada no método real
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
    }

    // mocks seriam:
    const token = 'token';
    const req: Partial<Request> = {
    headers: {
        authorization: `Bearer ${token}`,
    },
    decodedUser: undefined,
    };

    const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
        getRequest: <T = Request>() => req as T,
        getResponse: jest.fn(),
        getNext: jest.fn(),
        }),
    };

    // mocks seriam utilizados assim, nesse caso:
    const result = await authGuard.canActivate(
        mockExecutionContext as ExecutionContext,
    );
```

# 2

Os testes devem cobrir todos os escopos e métodos dentro do método/classe/função:
Uma boa bateria de testes segue o exemplo:

```
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // possui testes
        const req = context.switchToHttp().getRequest<Request>();
        // possui testes
        const token = this.extractTokenFromRequest(req);

        if (!token) {
            // possui testes
        throw new UnauthorizedException(missingTokenMessage);
        }

        try {
            // possui testes
            const decodedUser = await this.jwtService.verifyAsync<TokenPayloadDto>(
                token,
                this.jwtConfiguration.options.verifyOptions,
            );
            req.decodedUser = decodedUser;
            // possui testes
            return true;
        } catch (error) {
            // possui testes
            return false;
        }
  }
```

Uma bateria de testes RUIM segue o exemplo:

```
    async canActivate(context: ExecutionContext): Promise<boolean> {
    // possui testes
    const req = context.switchToHttp().getRequest<Request>();
    // possui testes
    const token = this.extractTokenFromRequest(req);

    if (!token) {
        // NÃO possui testes
      throw new UnauthorizedException(missingTokenMessage);
    }
    }
```

# 3

Os testes devem seguir o método AAA (Arrange, Act, Assert)

Exemplo:

```
    describe('Create', () => {
        // mock data
        const persistedBooking = {
            guest: {
                id: 1,
                created_at: new Date(),
                updated_at: new Date(),
                first_name: 'john',
                last_name: 'doe',
                email: 'john_doe@email.com',
                phone_number: '+5511999988899',
            },
            payment_status: {
                id: 2,
                payment_status_name: PaymentStatus.PENDING,
            },
            payment_status_id: 2,
            booking_amount: 0,
            id: 1,
            checkin_date: checkinDate,
            checkout_date: checkoutDate,
            num_adults: 1,
            num_children: 2,
            created_at: new Date(),
            updated_at: new Date(),
        }
        // mockData
        const booking = {
            addon_id: 1,
            booking_amount: 0,
            checkin_date: new Date(),
            checkout_date: new Date(),
            guest_id: 1,
            num_adults: 1,
            num_children: 0,
            payment_status_id: 1,
            room_id: 1,
        };

        it('should call the method without errors', async () => {
            # Arrange
            bookingService.create.mockResolvedValueOnce(persistedBooking);

            # Act
            const result = await bookingController.create(booking);

            # Assert
            expect(result).toEqual(persistedBooking);
            expect(bookingService.create).toHaveBeenCalledTimes(1);
            expect(bookingService.create).toHaveBeenCalledWith(//follow implementation with mock data);
        });
    });
```

As asserções DEVEM SEMPRE verificar a quantidade de chamadas e com o que foi chamado < Regra absoluta para todos testes unitários

Para testar possíveis rejeições de promise, usa-se o seguinte modelo:

```
    const prismaClientKnownError = new PrismaClientKnownRequestError('generic', {
        code: 'P2027',
        clientVersion: '5.19.0',
    });

    // Outros testes

    it('should throw error when calling the method', async () => {
      bookingService.create.mockRejectedValueOnce(prismaClientKnownError);

      await expect(bookingController.create(booking)).rejects.toThrow(
        'generic',
      );
      expect(bookingService.create).toHaveBeenCalledTimes(1);
      expect(bookingService.create).toHaveBeenCalledWith(booking);
    });
```

Lembre-se: este é um exemplo que usa prisma, caso o projeto não o use, usar erros específicos do ORM utilizado ou um new Error('generic') genérico.

# 4

Caso o projeto utilize prisma, prefire mocks da seguinte forma:

import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('SchedulingService', () => {
let mockDatabaseService: DeepMockProxy<//A classe que extende o PrismaClient>;

    // código

    beforeAll(async () => {
        mockDatabaseService = mockDeep<DatabaseService>();

        // código
    })

})

ou seja, os mocks são dos models completos, evite Partial.
