## Princípios básicos e responsabilidades inquebráveis

Seguiremos a teoria da "pirâmide de testes", que é a seguinte:

# A Base: Testes de Unidade (Unit Tests)

É a fundação da pirâmide e a camada mais volumosa.

O que testam: Pedaços minúsculos e isolados do código, como uma única função, método ou classe, sem interagir com dependências externas (bancos de dados, redes, sistema de arquivos).

Características: São extremamente rápidos para executar (milissegundos), fáceis de escrever e baratos para manter.

Proporção: Devem compor a grande maioria dos testes.

- **Padrões de Código e Estruturação para testes unitários (unit tests):** Consulte `docs/rules/unit-tests-rules.md`

# O Meio: Testes de Integração (Integration Tests)

Como o próprio nome sugere, esta camada verifica se as diferentes partes do sistema funcionam bem juntas.

O que testam: A comunicação entre os módulos da sua aplicação ou entre a aplicação e serviços externos. Por exemplo: verificar se o seu código consegue inserir e buscar dados no banco de dados corretamente, ou se consegue enviar uma mensagem para um broker (como RabbitMQ ou Redis).

Características: São mais lentos que os testes de unidade, pois exigem a subida de infraestrutura ou conexões de rede.

Proporção: Devemos ter uma quantidade moderada deles. Menos que os de unidade, mas o suficiente para garantir que os "fios estão todos conectados".

- **Padrões de Código e Estruturação para testes de integração (Integration Tests):** Consulte `docs/rules/integration-tests-rules.md`

# O Topo: Testes Ponta a Ponta (E2E - End-to-End Tests)

Ficam na ponta da pirâmide e são os testes de mais alto nível (topo).

O que testam: O sistema inteiro de ponta a ponta, simulando o comportamento de um usuário real. Isso pode envolver abrir um navegador, clicar em botões, preencher formulários, ou, no caso de uma API, fazer uma requisição HTTP real que passará por todas as camadas (roteamento, regras de negócio, banco de dados) até retornar a resposta.

Características: São os testes que dão a maior confiança de que o sistema funciona na prática, mas têm um preço alto: são muito lentos para executar, difíceis de configurar, mais caros para manter e propensos a falhas intermitentes (os chamados flaky tests — falham por problemas de rede ou timeout, não por bugs no código).

Proporção: Devem ser usados com parcimônia. Você deve focar apenas nos fluxos críticos do sistema (ex: processo de login, finalização de uma compra).

- **Padrões de Código e Estruturação para testes ponta a ponta (E2E - End-to-End Tests):** Consulte `docs/rules/integration-tests-rules.md`
