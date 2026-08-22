# Snapshots de regras Semgrep

Estes arquivos são cópias imutáveis das configurações compiladas entregues
pelo Registry oficial do Semgrep em 22 de agosto de 2026:

| Arquivo              | Fonte oficial                           | Regras | SHA-256                                                            |
| -------------------- | --------------------------------------- | -----: | ------------------------------------------------------------------ |
| `owasp-top-ten.json` | `https://semgrep.dev/c/p/owasp-top-ten` |    560 | `1fff4cefffa4debfe8e4f61cf1a8b1b022d98b72b1a9d72d4eeef8a5eeaa8a53` |
| `nodejs.json`        | `https://semgrep.dev/c/p/nodejs`        |     36 | `eb9ce79ff8974938061ec2ab0bb1e8c20a17372458cfaa4e8bcb24ac7e22a41f` |
| `typescript.json`    | `https://semgrep.dev/c/p/typescript`    |     74 | `6248ea7477e6da0db10305c0281f7cd908485691747f4fd641275145075f3b22` |

Os três conjuntos têm sobreposição intencional e produzem uma união de 563
IDs. O CI confere hashes, quantidades e IDs antes de aceitar o relatório SAST e
executa o scanner sem acesso à rede.

Uma atualização deve ocorrer em alteração separada e revisável: baixar pelos
mesmos endpoints com `Accept: application/json`, comparar IDs e achados, atualizar
os três hashes e obter nova aprovação de Segurança. Não se deve substituir estes
arquivos automaticamente durante a execução do CI.
