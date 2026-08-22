# Padrão de comentários do código

## Idioma

Comentários escritos pela equipe neste projeto usam português do Brasil. Nomes
técnicos, identificadores públicos, códigos de erro e termos padronizados podem
permanecer em inglês quando traduzi-los prejudicar a precisão ou a integração
com uma ferramenta.

## O que deve ser comentado

O comentário deve explicar principalmente **por que** uma decisão existe:

- regra de negócio ou exceção que não seja evidente pelo código;
- limite de segurança, isolamento entre empresas ou falha fechada;
- fórmula, arredondamento, divisor ou decisão temporal;
- transação, bloqueio, idempotência, concorrência, retry ou circuit breaker;
- dado protegido, auditoria, retenção ou requisito de rastreabilidade;
- compatibilidade temporária, dívida técnica ou condição para remoção futura.

Funções públicas complexas podem receber documentação curta indicando propósito,
pré-condições, efeitos e falhas relevantes.

## O que não deve ser comentado

- repetir literalmente uma atribuição, condição ou nome de função;
- descrever sintaxe da linguagem;
- manter código antigo comentado em vez de usar o histórico do Git;
- registrar senha, token, CPF, salário, resultado clínico ou qualquer dado real;
- usar comentário para esconder uma regra que deveria estar em teste, tipo,
  validação ou documentação funcional.

## Manutenção

Uma alteração de comportamento atualiza no mesmo trabalho o código, os testes e
os comentários relacionados. Comentário desatualizado é tratado como defeito.
Antes de aprovar uma revisão, deve-se conferir se comentários continuam coerentes
com as regras e se não revelam dados sensíveis.

## Exemplo

```ts
// O contexto da empresa vale somente nesta transação para impedir que uma
// conexão reutilizada pelo pool carregue o CNPJ da requisição anterior.
await definirContextoDaEmpresa(cliente, empresaId);
```

Evite:

```ts
// Define a empresa.
await definirContextoDaEmpresa(cliente, empresaId);
```
