param(
    [string]$Base = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'

function Get-MarkdownCells {
    param([string]$Line)
    $parts = $Line -split '\|'
    if ($parts.Count -lt 3) {
        return @()
    }
    return @($parts[1..($parts.Count - 2)] | ForEach-Object { $_.Trim() })
}

function Get-Matrix {
    param(
        [string]$Path,
        [ValidateSet('18A', '20A', '21A')]
        [string]$Kind
    )

    $map = [ordered]@{}
    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        if (-not $line.StartsWith('|')) {
            continue
        }
        $cells = Get-MarkdownCells -Line $line
        $valid = switch ($Kind) {
            '18A' {
                $cells.Count -eq 6 -and
                $cells[5].StartsWith("TST-$($cells[0])")
            }
            '20A' {
                $cells.Count -eq 9 -and
                $cells[1].StartsWith('OPR-') -and
                $cells[8] -eq "TST-$($cells[0])"
            }
            '21A' {
                $cells.Count -eq 6 -and
                $cells[1].StartsWith('OPR-') -and
                $cells[5] -eq "TST-$($cells[0])"
            }
        }
        if ($valid) {
            $map[$cells[0]] = $cells
        }
    }
    return $map
}

function Get-Suite {
    param([string]$Id)
    switch -Regex ($Id) {
        '^B01-' { return 'ST-01' }
        '^B02-' { return 'ST-02' }
        '^B03-' { return 'ST-03' }
        '^B04-' { return 'ST-04' }
        '^B05-' { return 'ST-05' }
        '^B06-' { return 'ST-06' }
        '^K07-' { return 'ST-07' }
        '^G08-' { return 'ST-08' }
        '^P09-' { return 'ST-09' }
        '^(C10|P10|N10)-' { return 'ST-10' }
        '^(R11|A11|L11)-' { return 'ST-11' }
        '^D12-' { return 'ST-12' }
        '^ASO-' { return 'ST-13' }
        '^CLI-' { return 'ST-14' }
        '^NOT-' { return 'ST-15' }
        '^EXP-' { return 'ST-16' }
        '^INC-' { return 'ST-17' }
        '^(UI|CON)-' { return 'ST-18' }
        default { throw "Suíte desconhecida para $Id" }
    }
}

function Join-Unique {
    param([string[]]$Values)
    return (($Values | Where-Object { $_ } | Select-Object -Unique) -join '/')
}

function Get-Packages {
    param(
        [string]$Id,
        [string]$Suite,
        [string]$Class,
        [string]$Transaction,
        [string]$Repeat,
        [string]$Authorization
    )
    $values = [System.Collections.Generic.List[string]]::new()
    if ($Class -eq 'HTTP') {
        $values.Add('PAC-AUT-01')
        $values.Add('PAC-SES-01')
    }
    if ($Transaction -match 'TX-002|TX-003|TX-004|TX-005|TX-006') {
        $values.Add('PAC-MUT-01')
    }
    if (
        $Transaction -match 'TX-001|TX-002|TX-004|TX-005|TX-006|TX-007|TX-008' -or
        $Suite -notin @('ST-01', 'ST-03', 'ST-14', 'ST-17') -or
        $Id -in @('B03-USR-12', 'B03-USR-13', 'B03-USR-14', 'B03-PRF-09') -or
        $Id -match '^B03-PRF-0[1-7]$'
    ) {
        $values.Add('PAC-EMP-01')
    }
    if (
        $Repeat -match 'IDEM-0[12]|mesma chave|chave da tarefa' -or
        ($Repeat -notmatch 'sem idempotência' -and $Repeat -match 'idempot')
    ) {
        $values.Add('PAC-IDEM-01')
        $values.Add('PAC-REC-01')
    }
    if (
        "$Repeat $Transaction" -notmatch 'sem (idempotência ou )?concorrência' -and
        "$Repeat $Transaction" -match 'CONC|versão|lock|fingerprint|lease'
    ) {
        $values.Add('PAC-CON-01')
    }
    if (
        $Authorization -notmatch 'sem auditoria' -and
        $Authorization -match 'APIAUD|auditor'
    ) {
        $values.Add('PAC-AUD-01')
    }
    if ($Class -eq 'JOB_WORKER' -or $Transaction -match 'TX-007') {
        $values.Add('PAC-JOB-01')
    }
    if ($Class -eq 'JOB_TEMPORAL' -or $Transaction -match 'TX-008') {
        $values.Add('PAC-TEM-01')
    }
    if ($Class -eq 'UI_LOCAL') {
        $values.Add('PAC-UI-01')
        $values.Add('PAC-ACE-01')
    }
    if ($Class -eq 'POLITICA') {
        if ("$Repeat $Transaction" -notmatch 'sem (idempotência ou )?concorrência') {
            $values.Add('PAC-CON-01')
        }
        $values.Add('PAC-AUT-01')
        if ($Authorization -notmatch 'sem auditoria') {
            $values.Add('PAC-AUD-01')
        }
    }
    if ($Suite -in @(
        'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-06', 'ST-07', 'ST-08',
        'ST-09', 'ST-10', 'ST-11', 'ST-12', 'ST-13', 'ST-14', 'ST-15', 'ST-16'
    )) {
        $values.Add('PAC-CAM-01')
    }
    if ($Suite -eq 'ST-13') {
        $values.Add('PAC-SEN-01')
    }
    if ($Suite -eq 'ST-16') {
        $values.Add('PAC-XLS-01')
        $values.Add('PAC-SEN-01')
    }
    if ($Suite -eq 'ST-11') {
        $values.Add('PAC-SEN-01')
    }
    if ($Suite -eq 'ST-17') {
        $values.Add('PAC-APP-01')
        $values.Add('PAC-SEN-01')
        $values.Add('PAC-AUD-01')
    }
    return Join-Unique -Values $values
}

function Get-Levels {
    param(
        [string]$Suite,
        [string]$Class,
        [string]$Packages
    )
    $values = [System.Collections.Generic.List[string]]::new()
    if ($Class -in @('HTTP_INTERNO', 'PROJECAO', 'JOB_TEMPORAL')) {
        $values.Add('NIV-UNIT')
    }
    if ($Class -eq 'HTTP') {
        $values.Add('NIV-API')
        $values.Add('NIV-E2E')
    }
    if ($Class -in @('HTTP', 'HTTP_INTERNO', 'JOB_WORKER', 'JOB_TEMPORAL', 'POLITICA')) {
        $values.Add('NIV-PG')
    }
    if ($Class -in @('JOB_WORKER', 'JOB_TEMPORAL')) {
        $values.Add('NIV-JOB')
    }
    if ($Class -eq 'UI_LOCAL') {
        $values.Add('NIV-COMP')
        $values.Add('NIV-E2E')
    }
    if ($Suite -in @('ST-01', 'ST-02', 'ST-03', 'ST-13', 'ST-16', 'ST-17', 'ST-18')) {
        $values.Add('NIV-SEC')
    }
    if ($Packages -match '(^|/)PAC-(CAM|SEN)-01($|/)') {
        $values.Add('NIV-SEC')
    }
    if (
        $Suite -in @('ST-04', 'ST-05', 'ST-06', 'ST-07', 'ST-08', 'ST-09', 'ST-10', 'ST-11', 'ST-12', 'ST-13', 'ST-14', 'ST-15', 'ST-16', 'ST-17') -and
        $Class -ne 'UI_LOCAL'
    ) {
        $values.Add('NIV-E2E')
    }
    $values.Add('NIV-HML')
    return Join-Unique -Values $values
}

function Get-Masses {
    param(
        [string]$BaseMasses,
        [string]$Packages
    )
    $values = [System.Collections.Generic.List[string]]::new()
    foreach ($mass in ($BaseMasses -split '/')) {
        if ($mass) { $values.Add($mass) }
    }
    if ($Packages -match '(^|/)PAC-CAM-01($|/)') { $values.Add('MASS-FLD') }
    if ($Packages -match '(^|/)PAC-EMP-01($|/)') { $values.Add('MASS-TEN') }
    return Join-Unique -Values $values
}

function Get-Evidence {
    param(
        [string]$Suite,
        [string]$Class,
        [string]$Authorization,
        [string]$Repeat,
        [string]$Transaction,
        [string]$Packages
    )
    $values = [System.Collections.Generic.List[string]]::new()
    $values.Add('EV-CASO')
    if ($Class -eq 'HTTP') { $values.Add('EV-HTTP') }
    if (
        $Class -in @('HTTP', 'HTTP_INTERNO', 'JOB_WORKER', 'JOB_TEMPORAL', 'POLITICA') -or
        $Packages -match '(^|/)PAC-EMP-01($|/)'
    ) {
        $values.Add('EV-BD')
    }
    if ($Packages -match '(^|/)PAC-JOB-01($|/)') { $values.Add('EV-JOB') }
    if ($Packages -match '(^|/)PAC-TEM-01($|/)') { $values.Add('EV-TEM') }
    if ($Packages -match '(^|/)PAC-UI-01($|/)') {
        $values.Add('EV-UI')
    }
    if ($Packages -match '(^|/)PAC-ACE-01($|/)') {
        $values.Add('EV-ACE')
    }
    if ($Class -eq 'PROJECAO') { $values.Add('EV-UNIT') }
    if ($Packages -match '(^|/)PAC-CON-01($|/)') { $values.Add('EV-CONC') }
    if ($Packages -match '(^|/)PAC-AUD-01($|/)') { $values.Add('EV-AUD') }
    if ($Suite -in @('ST-05', 'ST-06', 'ST-07', 'ST-08', 'ST-09', 'ST-10', 'ST-11', 'ST-12')) {
        $values.Add('EV-CALC')
    }
    if (
        $Suite -eq 'ST-11' -or
        $Packages -match '(^|/)PAC-XLS-01($|/)'
    ) { $values.Add('EV-ARQ') }
    if ($Packages -match '(^|/)PAC-(AUT|SES|EMP|CAM|SEN|APP)-01($|/)') {
        $values.Add('EV-SEG')
    }
    return Join-Unique -Values $values
}

function Escape-Cell {
    param([string]$Value)
    return (($Value -replace '\|', '&#124;') -replace '\r?\n', ' ').Trim()
}

$matrix18 = Get-Matrix -Path (Join-Path $Base '18a-matriz-rastreabilidade-transicoes.md') -Kind '18A'
$matrix20 = Get-Matrix -Path (Join-Path $Base '20a-matriz-rastreabilidade-api-autorizacao-transicoes.md') -Kind '20A'
$matrix21 = Get-Matrix -Path (Join-Path $Base '21a-matriz-rastreabilidade-backlog-etapas.md') -Kind '21A'

if ($matrix18.Count -ne 440 -or $matrix20.Count -ne 440 -or $matrix21.Count -ne 440) {
    throw "Contagem inválida: 18A=$($matrix18.Count), 20A=$($matrix20.Count), 21A=$($matrix21.Count)"
}

$profiles = @{
    HTTP         = 'PFT-HTTP'
    HTTP_INTERNO = 'PFT-INT'
    JOB_WORKER   = 'PFT-JOB'
    JOB_TEMPORAL = 'PFT-TEM'
    UI_LOCAL     = 'PFT-UI'
    PROJECAO     = 'PFT-PRJ'
    POLITICA     = 'PFT-POL'
}

$gates = @{
    'ETP-00'  = 'GAT-01/02'
    'ETP-01'  = 'GAT-03'
    'ETP-02'  = 'GAT-02'
    'ETP-03'  = 'GAT-04'
    'ETP-04A' = 'GAT-05/06'
    'ETP-04B' = 'GAT-05/06'
    'ETP-04C' = 'GAT-02/08'
    'ETP-05'  = 'GAT-06'
    'ETP-06'  = 'GAT-07'
    'ETP-07'  = 'GAT-06/07'
    'ETP-08A' = 'GAT-08'
    'ETP-08B' = 'GAT-04/09'
    'ETP-09'  = 'GAT-06/07/08'
    'ETP-10'  = 'GAT-01–09'
}

$masses = @{
    'ST-01' = 'MASS-BASE/MASS-AUT'
    'ST-02' = 'MASS-BASE/MASS-TEN'
    'ST-03' = 'MASS-BASE/MASS-AUT/MASS-FLD'
    'ST-04' = 'MASS-CAD/MASS-TEN'
    'ST-05' = 'MASS-MEI/MASS-TEN/MASS-D30'
    'ST-06' = 'MASS-CAD/MASS-FIN/MASS-D30'
    'ST-07' = 'MASS-FIN/MASS-D30'
    'ST-08' = 'MASS-FIN/MASS-D30'
    'ST-09' = 'MASS-FIN/MASS-D30'
    'ST-10' = 'MASS-FIN/MASS-D30/MASS-DOC'
    'ST-11' = 'MASS-FIN/MASS-DOC'
    'ST-12' = 'MASS-CAD/MASS-FIN/MASS-D30/MASS-ASO'
    'ST-13' = 'MASS-CAD/MASS-ASO'
    'ST-14' = 'MASS-BASE/MASS-ASO'
    'ST-15' = 'MASS-BASE/MASS-ASO'
    'ST-16' = 'MASS-TEN/MASS-DOC'
    'ST-17' = 'MASS-AUT/MASS-INC'
    'ST-18' = 'MASS-BASE/MASS-TEN/MASS-FLD'
}

$homologation = @{
    'ST-01' = 'HML-ENG/SEG'
    'ST-02' = 'HML-ENG/SEG/PROD'
    'ST-03' = 'HML-ENG/SEG/PROD'
    'ST-04' = 'HML-DP/PROD'
    'ST-05' = 'HML-DP/CTB/PROD'
    'ST-06' = 'HML-DP/CTB'
    'ST-07' = 'HML-DP/CTB'
    'ST-08' = 'HML-DP/CTB'
    'ST-09' = 'HML-DP/CTB'
    'ST-10' = 'HML-DP/CTB'
    'ST-11' = 'HML-DP/CTB/JUR/PROD'
    'ST-12' = 'HML-DP/CTB/JUR'
    'ST-13' = 'HML-DP/JUR/SEG'
    'ST-14' = 'HML-DP/PROD'
    'ST-15' = 'HML-DP/PROD'
    'ST-16' = 'HML-DP/SEG/JUR'
    'ST-17' = 'HML-SEG/JUR/PROD'
    'ST-18' = 'HML-ENG/SEG/PROD'
}

$expected = [ordered]@{
    'ST-01' = 28
    'ST-02' = 22
    'ST-03' = 40
    'ST-04' = 12
    'ST-05' = 21
    'ST-06' = 39
    'ST-07' = 15
    'ST-08' = 18
    'ST-09' = 21
    'ST-10' = 29
    'ST-11' = 27
    'ST-12' = 34
    'ST-13' = 48
    'ST-14' = 7
    'ST-15' = 17
    'ST-16' = 14
    'ST-17' = 10
    'ST-18' = 38
}

$rows = [System.Collections.Generic.List[string]]::new()
$counts = @{}

foreach ($id in $matrix21.Keys) {
    if (-not $matrix18.Contains($id) -or -not $matrix20.Contains($id)) {
        throw "ID sem junção: $id"
    }
    $row18 = $matrix18[$id]
    $row20 = $matrix20[$id]
    $row21 = $matrix21[$id]
    if ($row20[1] -ne $row21[1]) {
        throw "OPR divergente em $id"
    }

    $suite = Get-Suite -Id $id
    $counts[$suite] = 1 + [int]$counts[$suite]
    $scopeParts = $row18[5] -split '—', 2
    $scope = if ($scopeParts.Count -eq 2) { $scopeParts[1].Trim() } else { $row18[4] }
    $class = $row20[2]
    if (-not $profiles.ContainsKey($class)) {
        throw "Classe desconhecida em ${id}: $class"
    }
    $packages = Get-Packages -Id $id -Suite $suite -Class $class -Transaction $row20[5] -Repeat $row20[6] -Authorization $row20[7]

    $values = @(
        $row21[5],
        $id,
        $suite,
        $row21[1],
        $row21[2],
        $row21[3],
        $row21[4],
        $class,
        $row20[3],
        $row20[4],
        $scope,
        $profiles[$class],
        $packages,
        (Get-Masses -BaseMasses $masses[$suite] -Packages $packages),
        (Get-Levels -Suite $suite -Class $class -Packages $packages),
        (Get-Evidence -Suite $suite -Class $class -Authorization $row20[7] -Repeat $row20[6] -Transaction $row20[5] -Packages $packages),
        $homologation[$suite],
        $gates[$row21[4]]
    ) | ForEach-Object { Escape-Cell -Value $_ }

    $rows.Add('| ' + ($values -join ' | ') + ' |')
}

foreach ($suite in $expected.Keys) {
    if ([int]$counts[$suite] -ne $expected[$suite]) {
        throw "Contagem inválida em ${suite}: $($counts[$suite]) em vez de $($expected[$suite])"
    }
}

$header = @'
# Documento 22A

## Matriz Executável de Casos, Perfis e Evidências

> **Status:** aprovado integralmente pelo usuário com o Documento 22 em 22 de agosto de 2026.  
> **Data-base:** 22 de agosto de 2026.  
> **Autoridade funcional:** Documento 17 aprovado.  
> **Rastreabilidade de dados e técnica:** Documentos 18A e 20A aprovados.  
> **Propriedade de execução:** Documento 21A aprovado.  
> **Estratégia:** Documento 22 aprovado.

---

# 1. Finalidade

Esta matriz converte, sem agrupamento implícito, as **440 âncoras funcionais** em casos-raiz executáveis. Cada linha preserva:

- o ID funcional;
- a família `OPR-*`;
- o `BK-*`, `EPC-*` e `ETP-*` proprietários;
- a classe e a realização técnica;
- o resultado/intenção primário;
- o perfil, os pacotes, as massas e os níveis de teste;
- as evidências, os homologadores e o gate.

A linha não tenta repetir todos os passos transversais. Ela é executada pela receita do Documento 22, seção 5.4, e pelos pacotes `PAC-*` declarados. Cada variação produz resultado individual sob o mesmo caso-raiz `TST-*`.

---

# 2. Contrato automático

O gate deverá provar:

1. conjunto de IDs desta matriz = Documentos 17, 18A, 20A e 21A;
2. total = **440 IDs funcionais**, sendo 436 transições e quatro regras de projeção `ASO-R*`;
3. duplicados = zero;
4. `TST` = `TST-` + ID funcional;
5. OPR, BK, EPC e ETP iguais ao Documento 21A;
6. classe e realização iguais ao Documento 20A;
7. exatamente um caso-raiz por ID;
8. perfil, pacotes, massas, níveis, evidências, homologação e gate não vazios;
9. toda referência declarada no Documento 22;
10. qualquer `N/A` futuro com código, fundamento e aprovação;
11. auditoria e requisitos não funcionais usam `QAT-*` e não adulteram os 440;
12. cobertura secundária de uma jornada não substitui o caso-raiz individual.

---

# 3. Dicionário compacto

## 3.1 Perfis

| Perfil | Classe |
|---|---|
| `PFT-HTTP` | operação pública tipada |
| `PFT-INT` | resultado interno do caso de uso |
| `PFT-JOB` | worker/outbox |
| `PFT-TEM` | tarefa/prazo temporal |
| `PFT-UI` | estado local da interface |
| `PFT-PRJ` | projeção pura |
| `PFT-POL` | política transversal |

## 3.2 Níveis

`NIV-UNIT` unidade/propriedade; `NIV-PG` integração PostgreSQL; `NIV-API` contrato; `NIV-COMP` componente; `NIV-E2E` ponta a ponta; `NIV-JOB` worker/tempo; `NIV-SEC` segurança; `NIV-HML` homologação.

## 3.3 Evidências

`EV-CASO` resultado estruturado; `EV-UNIT` unidade; `EV-HTTP` contrato; `EV-BD` banco/RLS/transação; `EV-AUD` auditoria; `EV-JOB` worker; `EV-TEM` relógio; `EV-UI` interface; `EV-ACE` acessibilidade; `EV-CONC` corrida; `EV-CALC` memória financeira; `EV-ARQ` arquivo/hash; `EV-SEG` segurança.

## 3.4 Homologadores

`HML-ENG` engenharia; `HML-SEG` segurança; `HML-DP` Departamento Pessoal; `HML-CTB` contábil; `HML-JUR` jurídico/privacidade; `HML-PROD` produto.

## 3.5 Gramática compacta

Quando IDs da mesma família aparecem separados por `/`, o prefixo da primeira referência se aplica às seguintes até o fim da célula. Assim, `MASS-BASE/AUT` expande para `MASS-BASE` e `MASS-AUT`; `HML-DP/CTB` expande para `HML-DP` e `HML-CTB`; `GAT-06/07` expande para `GAT-06` e `GAT-07`. Uma faixa como `GAT-01–09` expande todos os IDs inclusivos da mesma família. Valores já escritos com prefixo completo permanecem referências independentes.

---

# 4. Resumo

| Suíte | Linhas |
|---|---:|
'@

$summary = foreach ($suite in $expected.Keys) {
    "| $suite | $($expected[$suite]) |"
}

$matrixHeader = @'
| **Total** | **440** |

---

# 5. Matriz exaustiva

| TST | ID funcional | Suíte | OPR | BK | EPC | ETP | Classe | Realização | Resultado/intenção | Escopo de prova | Perfil | Pacotes aplicáveis | Massas | Níveis | Evidências | Homologação | Gate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
'@

$footer = @'

---

# 6. Regra de execução

Cada linha gera ao menos sua variação nominal — inclusive quando o resultado correto é uma recusa — e as variações determinadas pelos pacotes. O relatório final mantém o `TST` como raiz e apresenta cada sufixo `::NOM`, `::VAL`, `::AUT`, `::TEN`, `::FLD`, `::CTX`, `::CON`, `::IDM`, `::AUD`, `::FAL`, `::TMP`, `::DOC`, `::A11Y`, `::PERF`, `::MIG` ou `::REC` aplicável.

---

**Situação desta versão:** 440 linhas geradas, revisadas e aprovadas pelo usuário.  
**Continuidade vigente:** pacote 23/23A–23D aprovado; preparar o repositório e iniciar a `ETP-00`; execução permanece `NOT_RUN_PLANNED`.
'@

@(
    $header.TrimEnd()
    $summary
    $matrixHeader.TrimEnd()
    $rows
    $footer.TrimStart()
) -join [Environment]::NewLine
