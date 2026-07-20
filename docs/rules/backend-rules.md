## Estrutura de diretórios

Aplique uma estrutura de pastas consistente, novos módulos sempre terão suas respectivas pastas, exemplo:

```
    /backend
        /src
            /new-module
            /another-module
```

Pipes, Guards, Filters, Interceptors em sua respectiva pasta seguindo o exemplo a seguir:

```
    /backend
        /src
            /common
                /guards
                    generic.guard.ts
                /filters
                /pipes
                /interceptors
```

Em dúvida, sempre pergunte ao usuário onde deve colocar uma pasta ou arquivo novo, ou se algo precisa de separação ou não.

## Estilo de código

- Utilize princípios Clean Code para o código:
  dê nomes com significado e que refletem para que serve a função/método ou classe, ou o que a variável armazena ou para que serve.
- Priorize escalabilidade, separação de responsabilidades e organização de código. Exemplo:
  Pasta dto para cada módulo (caso hajam dtos naquele módulo)
  Pasta types para cada módulo (caso hajam types naquele módulo)
  etc.
- Utilize abstrações dentro de módulos que tem grandes chances de serem mudados no futuro para garantir facilidade de manutenção, exceto o módulo de Database. Exemplo:

```
    /backend
        /src
            /token
                token.service.protocol.ts // Implementa uma classe abstrata/interface, chamada de TokenServiceProtocol, para TokenService
                token.service.ts // Implementa um classe que extende a classe abstrata/interface TokenServiceProtocol
                token.module.ts // Vai registrar no campo Providers: [] do decorator @Module como { provide: TokenServiceProtocol, useClass: TokenService} e exportar TokenService.
```

Mais um exemplo de módulo que tem grandes chances de mudar no futuro: Módulo de cache, mas não necessariamente exclusivo a ele. Em caso de dúvida, perguntar ao usuário se o módulo a ser implementado deve ser abstraído.

- Sempre que um novo módulo for criado, adicione um caminho dentro de paths em ts.config.json e sempre use-o nas importações. Exemplo:

```
"paths": {
      "@app/*": [
        "./src/app/*"
      ],
}
```

em app.module.ts importamos assim:

```
import { AppService } from '@app/app.service';
```

---

- Evite blocos try catch, a não ser que seja imprescindível para evitar bugs ou comportamentos inesperados, sempre prefira Filters globais para lidar com erros como por exemplo o NotFoundException nativo do Nest.

---

- Faça uso "type safe" de variáveis de ambiente, prefira escrever dentro de uma pasta:

```
  /backend
    /algum-modulo
      /config
        algum-modulo.config.ts
```

com uso da função "registerAs" da biblioteca @nestjs/config, exemplo:

```
import { registerAs } from "@nestjs/config";

export default registerAs("auth", () => ({
  COOKIE_PATH: process.env.COOKIE_PATH as string,
}));
```

importando no módulo que a usa, exemplo:

```
import authConfig from "./config/auth-config";

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
  ]
})
export class AuthModule {}
```

```
import type { ConfigType } from "@nestjs/config";
import config from "./config/auth-config";

@Injectable()
export class AuthRepository { // Ou Service
  constructor(
    @Inject(config)
    private readonly authconfig: ConfigType<typeof config>,
  ) {}
}

```

---

Registre Pipes, Filters, Guards ou Interceptors GLOBAIS como Providers em `./backend/src/app/app.module.ts`, exemplo:

```
import { APP_FILTER, APP_PIPE } from "@nestjs/core";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: JwtErrorFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
  ],
})
export class AppModule {}
```

Nunca registre em main.ts, priorize organização de código e legibilidade.

---

Crie DTOs diferentes para Request (dados de entrada) e saída (dados de saída). Use a biblioteca class-validator para validações de DTOs.

## Segurança

- O código deve ser seguro, NUNCA usar segredos, senhas, URLs de conexão ou qualquer coisa do tipo hardcoded, sempre utilize variáveis de ambiente para tal.
- Arquivo .env jamais deve ter commit. Crie um arquivo .env.example com as credenciais e outras variáveis com seus valores sempre apagados.
- Sempre valide dados que vem no Body, Params ou Query Params do frontend utilizando bibliotecas relevantes (geralmente, a descrita no prompt do usuário ou no arquivo de stack). Bugs e SQL Injection devem ser evitados.
- Proteja todas as rotas com Guards com exceção a de criação de usuário e login.
- Rate Limiting é essencial para evitar Brute Force ou DoS.
- Avise ao usuário sobre código possivelmente com falhas de segurança, exemplo:
  - Risco de XSS (Cross Site Scripting) devido a dados sensíveis ou token no Local Storage.
  - Risco de Man in The Middle e vazamento de dados sensíveis: Dados sensíveis devem ir no token, e coisas como hash de senha, email ou `{ admin: true }` jamais devem estar no Body da resposta.
