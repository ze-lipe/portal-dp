param(
    [string]$Base = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$errors = [System.Collections.Generic.List[string]]::new()

function Add-CheckError {
    param([string]$Message)
    $script:errors.Add($Message)
}

function Get-MarkdownCells {
    param([string]$Line)
    $parts = $Line -split '\|'
    if ($parts.Count -lt 3) {
        return @()
    }
    return @($parts[1..($parts.Count - 2)] | ForEach-Object { $_.Trim() })
}

function Get-Rows {
    param(
        [string]$Path,
        [scriptblock]$Predicate
    )
    $rows = [System.Collections.Generic.List[object]]::new()
    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        if (-not $line.StartsWith('|')) {
            continue
        }
        $cells = Get-MarkdownCells -Line $line
        if (& $Predicate $cells) {
            $rows.Add($cells)
        }
    }
    return @($rows)
}

function Assert-EqualSet {
    param(
        [string]$NameA,
        [string[]]$A,
        [string]$NameB,
        [string[]]$B
    )
    $diff = @(Compare-Object ($A | Sort-Object -Unique) ($B | Sort-Object -Unique))
    if ($diff.Count -gt 0) {
        Add-CheckError "$NameA e $NameB divergem em $($diff.Count) entradas."
    }
}

function Expand-CompactCodes {
    param(
        [string]$Value,
        [string]$Prefix
    )
    $codes = [System.Collections.Generic.List[string]]::new()
    foreach ($part in @($Value -split '/')) {
        $trimmed = $part.Trim()
        if ($trimmed -match "^$([regex]::Escape($Prefix))-") {
            $codes.Add($trimmed)
        }
        elseif (-not [string]::IsNullOrWhiteSpace($trimmed)) {
            $codes.Add("$Prefix-$trimmed")
        }
    }
    return @($codes)
}

$paths = @{
    Master = Join-Path $Base '07-documento-mestre-planejamento-funcional.md'
    Doc16 = Join-Path $Base '16-consolidacao-final-prototipos.md'
    Doc17 = Join-Path $Base '17-matriz-formal-estados-transicoes.md'
    Doc18 = Join-Path $Base '18-modelo-logico-dados-relacionamentos-restricoes.md'
    Doc18A = Join-Path $Base '18a-matriz-rastreabilidade-transicoes.md'
    Doc19 = Join-Path $Base '19-arquitetura-tecnica-seguranca-infraestrutura-backup-observabilidade.md'
    Doc20 = Join-Path $Base '20-contratos-api-matriz-tecnica-autorizacao.md'
    Doc20A = Join-Path $Base '20a-matriz-rastreabilidade-api-autorizacao-transicoes.md'
    Doc21 = Join-Path $Base '21-backlog-priorizado-plano-desenvolvimento-etapas.md'
    Doc21A = Join-Path $Base '21a-matriz-rastreabilidade-backlog-etapas.md'
    Doc22 = Join-Path $Base '22-estrategia-testes-homologacao-rastreabilidade.md'
    Doc22A = Join-Path $Base '22a-matriz-executavel-casos-perfis-evidencias.md'
    Doc22B = Join-Path $Base '22b-matriz-conformidade-60-telas-subfluxos.md'
    Doc22C = Join-Path $Base '22c-inventario-executavel-testes-tecnicos-asvs.md'
    Doc22D = Join-Path $Base '22d-caderno-25-cenarios-compostos.md'
    Generator = Join-Path $Base 'gerar-documento-22a.ps1'
    AsvsBaseline = Join-Path $Base 'referencias/OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json'
}

foreach ($entry in $paths.GetEnumerator()) {
    if (-not (Test-Path -LiteralPath $entry.Value)) {
        Add-CheckError "Arquivo ausente: $($entry.Value)"
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

$rows18 = Get-Rows -Path $paths.Doc18A -Predicate {
    param($c)
    $c.Count -eq 6 -and $c[5].StartsWith("TST-$($c[0])")
}
$rows20 = Get-Rows -Path $paths.Doc20A -Predicate {
    param($c)
    $c.Count -eq 9 -and $c[1].StartsWith('OPR-') -and $c[8] -eq "TST-$($c[0])"
}
$rows21 = Get-Rows -Path $paths.Doc21A -Predicate {
    param($c)
    $c.Count -eq 6 -and $c[1].StartsWith('OPR-') -and $c[5] -eq "TST-$($c[0])"
}
$rows22 = Get-Rows -Path $paths.Doc22A -Predicate {
    param($c)
    $c.Count -eq 18 -and $c[0].StartsWith('TST-')
}

foreach ($item in @(
    @{ Name = '18A'; Rows = $rows18 },
    @{ Name = '20A'; Rows = $rows20 },
    @{ Name = '21A'; Rows = $rows21 },
    @{ Name = '22A'; Rows = $rows22 }
)) {
    if ($item.Rows.Count -ne 440) {
        Add-CheckError "$($item.Name) possui $($item.Rows.Count) linhas em vez de 440."
    }
    $idIndex = if ($item.Name -eq '22A') { 1 } else { 0 }
    $unique = @($item.Rows | ForEach-Object { $_[$idIndex] } | Sort-Object -Unique)
    if ($unique.Count -ne 440) {
        Add-CheckError "$($item.Name) possui $($unique.Count) IDs únicos em vez de 440."
    }
}

$ids18 = @($rows18 | ForEach-Object { $_[0] })
$ids20 = @($rows20 | ForEach-Object { $_[0] })
$ids21 = @($rows21 | ForEach-Object { $_[0] })
$ids22 = @($rows22 | ForEach-Object { $_[1] })

Assert-EqualSet '18A' $ids18 '20A' $ids20
Assert-EqualSet '18A' $ids18 '21A' $ids21
Assert-EqualSet '18A' $ids18 '22A' $ids22

$by20 = @{}
$by21 = @{}
$by22 = @{}
foreach ($row in $rows20) { $by20[$row[0]] = $row }
foreach ($row in $rows21) { $by21[$row[0]] = $row }
foreach ($row in $rows22) { $by22[$row[1]] = $row }

$profileByClass = @{
    HTTP = 'PFT-HTTP'
    HTTP_INTERNO = 'PFT-INT'
    JOB_WORKER = 'PFT-JOB'
    JOB_TEMPORAL = 'PFT-TEM'
    UI_LOCAL = 'PFT-UI'
    PROJECAO = 'PFT-PRJ'
    POLITICA = 'PFT-POL'
}

foreach ($id in $ids22) {
    if (-not $by20.ContainsKey($id) -or -not $by21.ContainsKey($id)) {
        continue
    }
    $r20 = $by20[$id]
    $r21 = $by21[$id]
    $r22 = $by22[$id]
    foreach ($comparison in @(
        @{ Name = 'OPR 20A→22A'; A = $r20[1]; B = $r22[3] },
        @{ Name = 'classe 20A→22A'; A = $r20[2]; B = $r22[7] },
        @{ Name = 'realização 20A→22A'; A = $r20[3]; B = $r22[8] },
        @{ Name = 'resultado 20A→22A'; A = $r20[4]; B = $r22[9] },
        @{ Name = 'OPR 21A→22A'; A = $r21[1]; B = $r22[3] },
        @{ Name = 'BK 21A→22A'; A = $r21[2]; B = $r22[4] },
        @{ Name = 'EPC 21A→22A'; A = $r21[3]; B = $r22[5] },
        @{ Name = 'ETP 21A→22A'; A = $r21[4]; B = $r22[6] },
        @{ Name = 'TST 20A→22A'; A = $r20[8]; B = $r22[0] },
        @{ Name = 'TST 21A→22A'; A = $r21[5]; B = $r22[0] }
    )) {
        if ($comparison.A -ne $comparison.B) {
            Add-CheckError "$($comparison.Name) divergente em $id."
        }
    }
    if ($profileByClass[$r22[7]] -ne $r22[11]) {
        Add-CheckError "Perfil incompatível com a classe em $id."
    }
    if ($r22[7] -eq 'HTTP' -and $r22[14] -notmatch '(^|/)NIV-E2E($|/)') {
        Add-CheckError "Camada E2E ausente para contrato HTTP com interface em $id."
    }

    $packages = @($r22[12] -split '/')
    if ($r20[6] -match 'sem idempotência' -and (
        $r20[6] -notmatch 'IDEM-0[12]|mesma chave|chave da tarefa' -and (
            $packages -contains 'PAC-IDEM-01' -or $packages -contains 'PAC-REC-01'
        )
    )) {
        Add-CheckError "Pacote de idempotência indevido em $id."
    }
    if ($r20[6] -match 'IDEM-0[12]|mesma chave|chave da tarefa' -and (
        $packages -notcontains 'PAC-IDEM-01' -or $packages -notcontains 'PAC-REC-01'
    )) {
        Add-CheckError "Pacote de idempotência/reconciliação ausente em $id."
    }
    if ($r20[7] -match 'sem auditoria' -and (
        $packages -contains 'PAC-AUD-01' -or $r22[15] -match '(^|/)EV-AUD($|/)'
    )) {
        Add-CheckError "Pacote/evidência de auditoria indevido em $id."
    }
    if ($r20[6] -match 'sem (idempotência ou )?concorrência' -and $packages -contains 'PAC-CON-01') {
        Add-CheckError "Pacote de concorrência indevido em $id."
    }
    if ($packages -notcontains 'PAC-CON-01' -and $r22[15] -match '(^|/)EV-CONC($|/)') {
        Add-CheckError "Evidência de concorrência sem pacote correspondente em $id."
    }
    if ($packages -contains 'PAC-CON-01' -and $r22[15] -notmatch '(^|/)EV-CONC($|/)') {
        Add-CheckError "Evidência de concorrência ausente em $id."
    }
    if ($packages -contains 'PAC-CAM-01' -and (
        $r22[13] -notmatch '(^|/)MASS-FLD($|/)' -or
        $r22[14] -notmatch '(^|/)NIV-SEC($|/)' -or
        $r22[15] -notmatch '(^|/)EV-SEG($|/)'
    )) {
        Add-CheckError "Massa/nível/evidência de campo incompleta em $id."
    }
    if ($packages -contains 'PAC-SEN-01' -and (
        $r22[14] -notmatch '(^|/)NIV-SEC($|/)' -or
        $r22[15] -notmatch '(^|/)EV-SEG($|/)'
    )) {
        Add-CheckError "Nível/evidência sensível incompleta em $id."
    }
    if ($packages -contains 'PAC-EMP-01' -and (
        $r22[13] -notmatch '(^|/)MASS-TEN($|/)' -or
        $r22[15] -notmatch '(^|/)EV-BD($|/)'
    )) {
        Add-CheckError "Massa/evidência multiempresa incompleta em $id."
    }
    if ($packages -contains 'PAC-JOB-01' -and $r22[15] -notmatch '(^|/)EV-JOB($|/)') {
        Add-CheckError "Evidência de worker ausente em $id."
    }
    if ($packages -contains 'PAC-TEM-01' -and $r22[15] -notmatch '(^|/)EV-TEM($|/)') {
        Add-CheckError "Evidência temporal ausente em $id."
    }
    if ($packages -contains 'PAC-XLS-01' -and $r22[15] -notmatch '(^|/)EV-ARQ($|/)') {
        Add-CheckError "Evidência de arquivo ausente em $id."
    }
    if ($r22[2] -in @(
        'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-06', 'ST-07', 'ST-08',
        'ST-09', 'ST-10', 'ST-11', 'ST-12', 'ST-13', 'ST-14', 'ST-15', 'ST-16'
    ) -and $packages -notcontains 'PAC-CAM-01') {
        Add-CheckError "Cobertura de permissão por campo ausente em $id."
    }
}

foreach ($id in @(
    'B03-USR-12', 'B03-USR-13', 'B03-USR-14',
    'B03-PRF-01', 'B03-PRF-02', 'B03-PRF-03', 'B03-PRF-04',
    'B03-PRF-05', 'B03-PRF-06', 'B03-PRF-07', 'B03-PRF-09'
)) {
    if ($by22.ContainsKey($id) -and $by22[$id][12] -notmatch '(^|/)PAC-EMP-01($|/)') {
        Add-CheckError "Cobertura multiempresa ausente em $id."
    }
}

foreach ($row in $rows22) {
    if ($row[0] -ne "TST-$($row[1])") {
        Add-CheckError "TST divergente para $($row[1])."
    }
    if (@($row | Where-Object { [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        Add-CheckError "Campo vazio na linha $($row[0])."
    }
}

$asoRules = @($ids22 | Where-Object { $_ -match '^ASO-R0[1-4]$' })
if ($asoRules.Count -ne 4) {
    Add-CheckError "22A possui $($asoRules.Count) regras ASO-R em vez de quatro."
}

$expectedSuites = [ordered]@{
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
foreach ($suite in $expectedSuites.Keys) {
    $actual = @($rows22 | Where-Object { $_[2] -eq $suite }).Count
    if ($actual -ne $expectedSuites[$suite]) {
        Add-CheckError "$suite possui $actual linhas em vez de $($expectedSuites[$suite])."
    }
}

$classes = @($rows22 | ForEach-Object { $_[7] } | Sort-Object -Unique)
$expectedClasses = @('HTTP', 'HTTP_INTERNO', 'JOB_TEMPORAL', 'JOB_WORKER', 'POLITICA', 'PROJECAO', 'UI_LOCAL')
Assert-EqualSet 'classes 22A' $classes 'classes esperadas' $expectedClasses

$inventory = Get-Rows -Path $paths.Doc16 -Predicate {
    param($c)
    $c.Count -eq 3 -and $c[0] -match '^[A-Z][0-9]{2}$'
}
$visual = Get-Rows -Path $paths.Doc22B -Predicate {
    param($c)
    $c.Count -eq 11 -and $c[0] -match '^QAT-UI-[A-Z][0-9]{2}$'
}
$technical = Get-Rows -Path $paths.Doc22C -Predicate {
    param($c)
    $c.Count -eq 10 -and $c[0] -match '^(TST-API|QAT-(AUD|SEC|PERF|RES|REC|A11Y|DOC))-\d{3}$'
}

if ($inventory.Count -ne 60) {
    Add-CheckError "Inventário do Documento 16 possui $($inventory.Count) linhas em vez de 60."
}
if ($visual.Count -ne 60) {
    Add-CheckError "Documento 22B possui $($visual.Count) linhas em vez de 60."
}

$expectedTechnical = [System.Collections.Generic.List[string]]::new()
foreach ($n in 1..22) { $expectedTechnical.Add(('TST-API-{0:D3}' -f $n)) }
foreach ($family in @(
    @{ Prefix = 'QAT-AUD'; Count = 8 },
    @{ Prefix = 'QAT-SEC'; Count = 41 },
    @{ Prefix = 'QAT-PERF'; Count = 7 },
    @{ Prefix = 'QAT-RES'; Count = 16 },
    @{ Prefix = 'QAT-REC'; Count = 8 },
    @{ Prefix = 'QAT-A11Y'; Count = 8 },
    @{ Prefix = 'QAT-DOC'; Count = 9 }
)) {
    foreach ($n in 1..$family.Count) {
        $expectedTechnical.Add(('{0}-{1:D3}' -f $family.Prefix, $n))
    }
}
$technicalIds = @($technical | ForEach-Object { $_[0] })
if ($technical.Count -ne 119) {
    Add-CheckError "Documento 22C possui $($technical.Count) casos técnicos em vez de 119."
}
Assert-EqualSet 'Documento 22C' $technicalIds 'inventário técnico esperado' @($expectedTechnical)
if (@($technicalIds | Sort-Object -Unique).Count -ne 119) {
    Add-CheckError 'Documento 22C possui IDs técnicos duplicados.'
}
$functionalRoots = @($rows22 | ForEach-Object { $_[0] })
if (@(Compare-Object $functionalRoots $technicalIds -IncludeEqual -ExcludeDifferent).Count -gt 0) {
    Add-CheckError 'Caso técnico do 22C entrou na baseline funcional do 22A.'
}

$sourceRules = [ordered]@{
    '^TST-API-' = 'SRC-API'
    '^QAT-AUD-' = 'SRC-AUD'
    '^QAT-SEC-' = 'SRC-SEC'
    '^QAT-PERF-' = 'SRC-PERF'
    '^QAT-RES-' = 'SRC-RES'
    '^QAT-REC-' = 'SRC-REC'
    '^QAT-A11Y-' = 'SRC-A11Y'
    '^QAT-DOC-' = 'SRC-DOC'
}
$allowedMasses = @(
    'MASS-22B', 'MASS-ASO', 'MASS-AUT', 'MASS-BASE', 'MASS-CAD', 'MASS-D30',
    'MASS-DOC', 'MASS-FIN', 'MASS-FLD', 'MASS-INC', 'MASS-LOAD', 'MASS-MEI',
    'MASS-REC', 'MASS-TEN'
)
$allowedLayers = @('CTR', 'CON', 'AUD', 'SEC', 'PIPE', 'PERF', 'FAL', 'REC', 'A11Y', 'DOC')
$allowedOwners = @('ENG', 'QA', 'SEG', 'OPS')
$allowedStages = @(
    'ETP-00', 'ETP-01', 'ETP-02', 'ETP-03', 'ETP-04A', 'ETP-04B', 'ETP-04C',
    'ETP-05', 'ETP-06', 'ETP-07', 'ETP-08A', 'ETP-08B', 'ETP-09', 'ETP-10', 'ETP-11'
)
$allowedGates = @(1..10 | ForEach-Object { 'GAT-{0:D2}' -f $_ })
$evidenceByLayer = @{
    CTR = 'EVD-CTR'; CON = 'EVD-CON'; AUD = 'EVD-AUD'; SEC = 'EVD-SEC';
    PIPE = 'EVD-PIPE'; PERF = 'EVD-PERF'; FAL = 'EVD-FAL'; REC = 'EVD-REC';
    A11Y = 'EVD-A11Y'; DOC = 'EVD-DOC'
}
foreach ($row in $technical) {
    if (@($row | Where-Object { [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        Add-CheckError "Campo vazio na linha técnica $($row[0])."
    }

    $expectedSource = $null
    foreach ($pattern in $sourceRules.Keys) {
        if ($row[0] -match $pattern) {
            $expectedSource = $sourceRules[$pattern]
            break
        }
    }
    if ($null -eq $expectedSource -or $row[2] -ne $expectedSource) {
        Add-CheckError "Fonte técnica incompatível em $($row[0])."
    }
    foreach ($mass in @($row[3] -split '/')) {
        if ($mass -notin $allowedMasses) {
            Add-CheckError "Massa técnica inválida '$mass' em $($row[0])."
        }
    }
    if ($row[4] -notin $allowedLayers) {
        Add-CheckError "Camada técnica inválida em $($row[0])."
    }
    if ($row[5] -notin $allowedOwners) {
        Add-CheckError "Proprietário técnico inválido em $($row[0])."
    }
    if ($row[6] -notin $allowedStages) {
        Add-CheckError "Etapa técnica inválida em $($row[0])."
    }
    foreach ($gate in @(Expand-CompactCodes -Value $row[7] -Prefix 'GAT')) {
        if ($gate -notin $allowedGates) {
            Add-CheckError "Gate técnico inválido '$gate' em $($row[0])."
        }
    }
    if ($evidenceByLayer[$row[4]] -ne $row[8]) {
        Add-CheckError "Evidência técnica incompatível com a camada em $($row[0])."
    }
}
$threatOwnersResolved = 0
foreach ($n in 1..27) {
    $id = 'QAT-SEC-{0:D3}' -f $n
    $ame = 'AME-{0:D2}' -f $n
    $row = @($technical | Where-Object { $_[0] -eq $id })
    if ($row.Count -ne 1 -or $row[0][9] -notmatch [regex]::Escape($ame)) {
        Add-CheckError "Ameaça proprietária $ame ausente ou divergente em $id."
    }
    else {
        $threatOwnersResolved++
    }
}
$doc22CText = Get-Content -LiteralPath $paths.Doc22C -Raw -Encoding UTF8
foreach ($term in @(
    '345 controles totais',
    '70 controles L1',
    '8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311',
    'https://www.w3.org/TR/2024/REC-WCAG22-20241212/',
    '480 combinações tela × caso-raiz',
    'QAT-A11Y-001::A01',
    'QAT-UI-A01'
)) {
    if (-not $doc22CText.Contains($term)) {
        Add-CheckError "Documento 22C não contém o contrato obrigatório: $term"
    }
}

$expectedAsvsHash = '8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311'
$actualAsvsHash = (Get-FileHash -LiteralPath $paths.AsvsBaseline -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualAsvsHash -ne $expectedAsvsHash) {
    Add-CheckError "SHA-256 da baseline ASVS diverge: $actualAsvsHash."
}
$asvsDocument = Get-Content -LiteralPath $paths.AsvsBaseline -Raw -Encoding UTF8 | ConvertFrom-Json
$asvsRequirements = @($asvsDocument.requirements)
$asvsIds = @($asvsRequirements | ForEach-Object { [string]$_.req_id })
$asvsUniqueIds = @($asvsIds | Sort-Object -Unique)
$asvsL1 = @($asvsRequirements | Where-Object { [string]$_.L -eq '1' })
if ($asvsRequirements.Count -ne 345) {
    Add-CheckError "Baseline ASVS possui $($asvsRequirements.Count) controles em vez de 345."
}
if ($asvsUniqueIds.Count -ne 345) {
    Add-CheckError "Baseline ASVS possui $($asvsUniqueIds.Count) IDs únicos em vez de 345."
}
if ($asvsL1.Count -ne 70) {
    Add-CheckError "Baseline ASVS possui $($asvsL1.Count) controles L1 em vez de 70."
}
foreach ($asvsId in $asvsIds) {
    if ($asvsId -notmatch '^V\d+\.\d+\.\d+$') {
        Add-CheckError "ID ASVS inválido: $asvsId."
    }
}

$traceRows = Get-Rows -Path $paths.Doc22C -Predicate {
    param($c)
    $c.Count -eq 3 -and $c[0] -match '^`(TST-API|QAT-)'
}
$traceRules = @(
    @{ Key = 'TST-API-001–022'; Pattern = '^TST-API-\d{3}$' },
    @{ Key = 'QAT-AUD-001–008'; Pattern = '^QAT-AUD-\d{3}$' },
    @{ Key = 'QAT-SEC-001–027'; Pattern = '^QAT-SEC-(00[1-9]|01\d|02[0-7])$' },
    @{ Key = 'QAT-SEC-028–040'; Pattern = '^QAT-SEC-(02[89]|03\d|040)$' },
    @{ Key = 'QAT-SEC-041'; Pattern = '^QAT-SEC-041$' },
    @{ Key = 'QAT-PERF-001–007'; Pattern = '^QAT-PERF-\d{3}$' },
    @{ Key = 'QAT-RES-001–016'; Pattern = '^QAT-RES-\d{3}$' },
    @{ Key = 'QAT-REC-001–008'; Pattern = '^QAT-REC-\d{3}$' },
    @{ Key = 'QAT-A11Y-001–008'; Pattern = '^QAT-A11Y-\d{3}$' },
    @{ Key = 'QAT-DOC-001–008'; Pattern = '^QAT-DOC-00[1-8]$' },
    @{ Key = 'QAT-DOC-009'; Pattern = '^QAT-DOC-009$' }
)
$traceByKey = @{}
foreach ($row in $traceRows) {
    $key = $row[0].Trim([char]0x60)
    if ($traceByKey.ContainsKey($key)) {
        Add-CheckError "Regra de rastreabilidade técnica duplicada: $key."
    }
    $traceByKey[$key] = $row
}
Assert-EqualSet 'regras técnicas declaradas' @($traceByKey.Keys) 'regras técnicas esperadas' @($traceRules | ForEach-Object { $_.Key })

$doc19Text = Get-Content -LiteralPath $paths.Doc19 -Raw -Encoding UTF8
$doc21Text = Get-Content -LiteralPath $paths.Doc21 -Raw -Encoding UTF8
foreach ($rule in $traceRules) {
    if (-not $traceByKey.ContainsKey($rule.Key)) {
        continue
    }
    $row = $traceByKey[$rule.Key]
    if ([string]::IsNullOrWhiteSpace($row[1]) -or [string]::IsNullOrWhiteSpace($row[2])) {
        Add-CheckError "Rastreabilidade técnica incompleta em $($rule.Key)."
    }
    foreach ($match in [regex]::Matches($row[1], 'ARQ-\d{3}')) {
        if (-not $doc19Text.Contains($match.Value)) {
            Add-CheckError "Referência técnica inexistente $($match.Value) em $($rule.Key)."
        }
    }
    $bkRefs = @([regex]::Matches($row[2], 'BK-\d{3}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
    $epcRefs = @([regex]::Matches($row[2], 'EPC-\d{2}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
    if ($bkRefs.Count -eq 0 -or $epcRefs.Count -eq 0) {
        Add-CheckError "BK/EPC garantidor ausente em $($rule.Key)."
    }
    foreach ($ref in @($bkRefs + $epcRefs)) {
        if (-not $doc21Text.Contains($ref)) {
            Add-CheckError "Referência de backlog inexistente $ref em $($rule.Key)."
        }
    }
}

$technicalTraceResolved = 0
foreach ($id in $technicalIds) {
    $matches = @($traceRules | Where-Object { $id -match $_.Pattern })
    if ($matches.Count -ne 1) {
        Add-CheckError "ID técnico $id resolve $($matches.Count) regras de rastreabilidade em vez de uma."
    }
    else {
        $technicalTraceResolved++
    }
}

$a11yRoots = @($technicalIds | Where-Object { $_ -match '^QAT-A11Y-' } | Sort-Object -Unique)
$a11yVisualIds = @($visual | ForEach-Object { $_[1] } | Sort-Object -Unique)
$a11yProjectedResults = $a11yRoots.Count * $a11yVisualIds.Count
if ($a11yRoots.Count -ne 8 -or $a11yVisualIds.Count -ne 60 -or $a11yProjectedResults -ne 480) {
    Add-CheckError "Projeção A11Y inválida: $($a11yRoots.Count) raízes × $($a11yVisualIds.Count) telas = $a11yProjectedResults."
}

$doc22DText = Get-Content -LiteralPath $paths.Doc22D -Raw -Encoding UTF8
$scenarioMatches = @([regex]::Matches(
    $doc22DText,
    '(?m)^### (CEN-CMP-\d{3}) — ([^\r\n]+)\r?$'
))
$scenarioIds = @($scenarioMatches | ForEach-Object { $_.Groups[1].Value })
$expectedScenarioIds = @(1..25 | ForEach-Object { 'CEN-CMP-{0:D3}' -f $_ })
$expectedScenarioTitles = @(
    'Início dia 1 e admissão dia 15',
    'Início dia 1 e admissão dia 20',
    'Fronteira inclusiva dos dias 15 e 16',
    'Fevereiro comum e composição numérica do pagamento final',
    'Fevereiro bissexto com 29 dias',
    'Mês com 31 dias',
    'Início e saída no mesmo dia',
    'Período sem registro atravessando competências',
    'RA alterada antes do adiantamento',
    'RA corrigida depois do adiantamento pago',
    'Complemento criado depois do adiantamento',
    'Desligamento antes da data do adiantamento',
    'Desligamento na data do adiantamento antes da confirmação',
    'Desligamento depois do adiantamento pago',
    'Desligamento na primeira competência',
    'Rescisão oficial e acerto de RA separados',
    'Recibo pago, cancelado e substituído',
    'MEI iniciando e encerrando no mesmo mês',
    'Renovação contínua sem alteração',
    'Renovação contínua com mudança de valor no meio do mês',
    'Serviço adicional MEI depois do pagamento final',
    'Campo oculto no painel, histórico e Excel',
    'Tentativa de acesso cruzado entre empresas',
    'ASO demissional com não comparecimento',
    'Retificação de ASO e alerta apenas pela versão vigente'
)
$masterScenarioPhrases = @(
    '1. Início dia 1 e admissão dia 15;',
    '2. Início dia 1 e admissão dia 20;',
    '3. Início ou admissão no dia 15 versus dia 16;',
    '4. Fevereiro com 28 dias;',
    '5. Fevereiro com 29 dias;',
    '6. Mês com 31 dias;',
    '7. Início e saída no mesmo dia;',
    '8. Período sem registro atravessando competências;',
    '9. RA alterada antes do adiantamento;',
    '10. RA alterada depois do adiantamento;',
    '11. Complemento criado depois do adiantamento;',
    '12. Desligamento antes da data prevista do vale;',
    '13. Desligamento na data do vale antes da confirmação;',
    '14. Desligamento depois do adiantamento pago;',
    '15. Desligamento na primeira competência;',
    '16. Rescisão oficial e acerto de RA;',
    '17. Recibo pago, cancelado e substituído;',
    '18. MEI iniciando e encerrando no mesmo mês;',
    '19. Renovação contínua sem alteração;',
    '20. Renovação contínua com mudança de valor no meio do mês;',
    '21. Serviço adicional MEI depois do pagamento final;',
    '22. Campo oculto no painel, histórico e Excel;',
    '23. Tentativa de acesso cruzado entre empresas;',
    '24. ASO demissional com não comparecimento;',
    '25. Retificação de ASO e alerta usando somente a versão vigente.'
)
if ($scenarioMatches.Count -ne 25) {
    Add-CheckError "Documento 22D possui $($scenarioMatches.Count) cenários em vez de 25."
}
Assert-EqualSet 'Documento 22D' $scenarioIds 'cenários compostos esperados' $expectedScenarioIds
if (@($scenarioIds | Sort-Object -Unique).Count -ne 25) {
    Add-CheckError 'Documento 22D possui IDs de cenário duplicados.'
}
$scenarioSectionEnd = $doc22DText.IndexOf('# 4. Rastreabilidade executável dos cenários')
if ($scenarioSectionEnd -lt 0) {
    Add-CheckError 'Documento 22D não possui limite canônico depois do CEN-CMP-025.'
    $scenarioSectionEnd = $doc22DText.Length
}
$requiredScenarioLabels = @('Entradas', 'Memória/oráculo', 'Recibos esperados', 'Estados finais')
$scenarioBlocks = @{}
for ($i = 0; $i -lt $scenarioMatches.Count; $i++) {
    if ($scenarioMatches[$i].Groups[1].Value -ne $expectedScenarioIds[$i]) {
        Add-CheckError "Ordem de cenário inválida na posição $($i + 1)."
    }
    if ($scenarioMatches[$i].Groups[2].Value -ne $expectedScenarioTitles[$i]) {
        Add-CheckError "Título divergente em $($expectedScenarioIds[$i])."
    }
    $startIndex = $scenarioMatches[$i].Index
    $endIndex = if ($i + 1 -lt $scenarioMatches.Count) {
        $scenarioMatches[$i + 1].Index
    }
    else {
        $scenarioSectionEnd
    }
    $block = $doc22DText.Substring($startIndex, $endIndex - $startIndex)
    $scenarioBlocks[$scenarioMatches[$i].Groups[1].Value] = $block
    $labelMatches = @([regex]::Matches($block, '(?m)^\*\*([^*\r\n]+):\*\*\s*(.+)$'))
    $actualLabels = @($labelMatches | ForEach-Object { $_.Groups[1].Value })
    if ($labelMatches.Count -ne 4) {
        Add-CheckError "Cenário $($scenarioMatches[$i].Groups[1].Value) possui $($labelMatches.Count) campos em vez de quatro."
    }
    elseif (($actualLabels -join '|') -ne ($requiredScenarioLabels -join '|')) {
        Add-CheckError "Campos fora da ordem canônica em $($scenarioMatches[$i].Groups[1].Value)."
    }
    foreach ($labelMatch in $labelMatches) {
        if ([string]::IsNullOrWhiteSpace($labelMatch.Groups[2].Value)) {
            Add-CheckError "Campo '$($labelMatch.Groups[1].Value)' vazio em $($scenarioMatches[$i].Groups[1].Value)."
        }
    }
}
$scenarioBlockContracts = @{
    'CEN-CMP-017' = @(
        'estado final de `N` passa a `Substituído`',
        '`N+1` fica `Substituto vigente`',
        '`N+2` documenta o ajuste definitivo',
        'snapshot e hash originais preservados'
    )
    'CEN-CMP-018' = @(
        'grupo de adiantamento tem valor devido zero e fica `Não aplicável`',
        'R$ 1.100,00 + serviço adicional integral R$ 200,00 = R$ 1.300,00',
        'não usa o estado trabalhista `Cancelado por desligamento`'
    )
    'CEN-CMP-022' = @(
        '`TST-API-005`',
        '`::FLD`',
        '`::DOC`',
        'busca, lista, ordenação, filtros, totais, detalhe, histórico, mensagens de erro, notificações, Excel e download',
        'ausência, e não máscara, zero, nulo ou coluna vazia'
    )
    'CEN-CMP-023' = @(
        'ID sintaticamente válido inexistente',
        'mesmo status, código de erro, corpo e cabeçalhos observáveis',
        'ensaio de indistinguibilidade temporal do Documento 22 §13.1',
        'RLS produz zero efeito de leitura e escrita'
    )
    'CEN-CMP-024' = @(
        'pendência demissional permanece até realização ou encerramento autorizado'
    )
    'CEN-CMP-025' = @(
        'surge exatamente uma nova ocorrência',
        'Repetição não duplica notificação'
    )
}
foreach ($scenarioId in $scenarioBlockContracts.Keys) {
    if (-not $scenarioBlocks.ContainsKey($scenarioId)) {
        Add-CheckError "Bloco obrigatório ausente: $scenarioId."
        continue
    }
    foreach ($snippet in $scenarioBlockContracts[$scenarioId]) {
        if (-not $scenarioBlocks[$scenarioId].Contains($snippet)) {
            Add-CheckError "Oráculo específico ausente em ${scenarioId}: $snippet"
        }
    }
}
foreach ($term in @(
    'K06 de R$ 960,00 e R$ 1.500,00',
    'salário redondo marcado',
    'seis confirmações independentes',
    'Pagamento oficial = R$ 1.800,00',
    'não subtrai novamente',
    'R$ 1.800,00 + R$ 590,00 + R$ 180,00 = R$ 2.570,00',
    'saldo final R$ 840,00',
    'desligamento informado em 25/09, depois das confirmações de 20/09',
    'recibo RA/reembolso do adiantamento R$ 480,00 preservado',
    'CEN-CMP-025'
)) {
    if (-not $doc22DText.Contains($term)) {
        Add-CheckError "Documento 22D não contém o oráculo obrigatório: $term"
    }
}

$masterText = Get-Content -LiteralPath $paths.Master -Raw -Encoding UTF8
foreach ($phrase in $masterScenarioPhrases) {
    if (-not $masterText.Contains($phrase)) {
        Add-CheckError "Documento Mestre não contém o cenário canônico: $phrase"
    }
}

$compositeTrace = Get-Rows -Path $paths.Doc22D -Predicate {
    param($c)
    $c.Count -eq 5 -and $c[0] -match '^CEN-CMP-\d{3}$'
}
$compositeTraceIds = @($compositeTrace | ForEach-Object { $_[0] })
if ($compositeTrace.Count -ne 25) {
    Add-CheckError "Documento 22D possui $($compositeTrace.Count) linhas de rastreabilidade em vez de 25."
}
Assert-EqualSet 'cenários do Documento 22D' $scenarioIds 'rastreabilidade composta' $compositeTraceIds
if (@($compositeTraceIds | Sort-Object -Unique).Count -ne 25) {
    Add-CheckError 'Documento 22D possui IDs duplicados na rastreabilidade composta.'
}
$allTestIds = @($functionalRoots + $technicalIds | Sort-Object -Unique)
$stageRank = @{
    'ETP-00' = 0; 'ETP-01' = 1; 'ETP-02' = 2; 'ETP-03' = 3
    'ETP-04A' = 4; 'ETP-04B' = 4; 'ETP-04C' = 4
    'ETP-05' = 5; 'ETP-06' = 6; 'ETP-07' = 7
    'ETP-08A' = 8; 'ETP-08B' = 8; 'ETP-09' = 9; 'ETP-10' = 10; 'ETP-11' = 11
}
$testStageById = @{}
$testEvidenceById = @{}
foreach ($testRow in $rows22) {
    $testStageById[$testRow[0]] = $testRow[6]
    $testEvidenceById[$testRow[0]] = $testRow[15]
}
foreach ($testRow in $technical) {
    $testStageById[$testRow[0]] = $testRow[6]
    $testEvidenceById[$testRow[0]] = $testRow[8]
}
$knownEvidence = @(
    @($rows22 | ForEach-Object { $_[15] -split '/' }) +
    @($technical | ForEach-Object { $_[8] -split '/' }) |
    ForEach-Object { $_.Trim() } |
    Sort-Object -Unique
)
$compositeTraceResolvedIds = [System.Collections.Generic.List[string]]::new()
$traceOwnersByScenario = @{}
$traceStageByScenario = @{}
foreach ($row in $compositeTrace) {
    $rowValid = $true
    if (@($row | Where-Object { [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        Add-CheckError "Campo vazio na rastreabilidade de $($row[0])."
        $rowValid = $false
    }
    $ownerIds = @($row[1] -split '/')
    $traceOwnersByScenario[$row[0]] = $ownerIds
    $traceStageByScenario[$row[0]] = $row[2]
    if (@($ownerIds | Sort-Object -Unique).Count -ne $ownerIds.Count) {
        Add-CheckError "Teste proprietário duplicado em $($row[0])."
        $rowValid = $false
    }
    if ($row[2] -notin $allowedStages) {
        Add-CheckError "Etapa inválida '$($row[2])' em $($row[0])."
        $rowValid = $false
    }
    $ownerEvidence = [System.Collections.Generic.List[string]]::new()
    foreach ($testId in $ownerIds) {
        if ($testId -notin $allTestIds) {
            Add-CheckError "Teste proprietário inexistente '$testId' em $($row[0])."
            $rowValid = $false
        }
        else {
            $ownerStage = $testStageById[$testId]
            if ($row[2] -in $allowedStages -and $stageRank[$ownerStage] -gt $stageRank[$row[2]]) {
                Add-CheckError "Dependência futura em $($row[0]): $testId pertence a $ownerStage, posterior a $($row[2])."
                $rowValid = $false
            }
            foreach ($ownerEvidenceId in @($testEvidenceById[$testId] -split '/')) {
                $ownerEvidence.Add($ownerEvidenceId)
            }
        }
    }
    foreach ($gate in @(Expand-CompactCodes -Value $row[3] -Prefix 'GAT')) {
        if ($gate -notin $allowedGates) {
            Add-CheckError "Gate inválido '$gate' em $($row[0])."
            $rowValid = $false
        }
    }
    foreach ($evidence in @($row[4] -split '/')) {
        if ($evidence -notin $knownEvidence) {
            Add-CheckError "Evidência inexistente '$evidence' em $($row[0])."
            $rowValid = $false
        }
        elseif ($evidence -notin @($ownerEvidence | Sort-Object -Unique)) {
            Add-CheckError "Evidência '$evidence' não é produzida pelos proprietários de $($row[0])."
            $rowValid = $false
        }
    }
    if ($rowValid) {
        $compositeTraceResolvedIds.Add($row[0])
    }
}
$scenarioOwnerContracts = @{
    'CEN-CMP-012' = @{ Stage = 'ETP-09'; Required = @('TST-D12-09', 'TST-D12-20', 'TST-G08-09'); Forbidden = @('TST-D12-14') }
    'CEN-CMP-013' = @{ Stage = 'ETP-09'; Required = @('TST-D12-09', 'TST-D12-20', 'TST-G08-09'); Forbidden = @('TST-D12-14') }
    'CEN-CMP-014' = @{ Stage = 'ETP-09'; Required = @('TST-D12-14', 'TST-D12-20'); Forbidden = @('TST-D12-09', 'TST-G08-09') }
    'CEN-CMP-015' = @{ Stage = 'ETP-09'; Required = @('TST-D12-14', 'TST-D12-20', 'TST-B06-PSR-06'); Forbidden = @('TST-D12-23') }
    'CEN-CMP-017' = @{ Stage = 'ETP-07'; Required = @('TST-R11-04', 'TST-R11-05', 'TST-C10-08', 'TST-P10-01', 'TST-P10-02'); Forbidden = @() }
    'CEN-CMP-018' = @{ Stage = 'ETP-06'; Required = @('TST-B05-CON-05', 'TST-G08-03', 'TST-G08-07', 'TST-R11-02'); Forbidden = @('TST-B05-CON-06', 'TST-G08-09') }
    'CEN-CMP-022' = @{ Stage = 'ETP-10'; Required = @('TST-API-005', 'TST-B03-PRF-03', 'TST-EXP-01'); Forbidden = @() }
    'CEN-CMP-023' = @{ Stage = 'ETP-00'; Required = @('TST-API-001', 'TST-API-002', 'QAT-SEC-006'); Forbidden = @() }
    'CEN-CMP-024' = @{ Stage = 'ETP-09'; Required = @('TST-ASO-A02', 'TST-ASO-A06', 'TST-NOT-O08'); Forbidden = @('TST-NOT-O10') }
    'CEN-CMP-025' = @{ Stage = 'ETP-10'; Required = @('TST-ASO-E05', 'TST-ASO-P05A', 'TST-ASO-P03', 'TST-ASO-P12', 'TST-NOT-O02', 'TST-NOT-O04'); Forbidden = @() }
}
$semanticInvalidScenarios = [System.Collections.Generic.HashSet[string]]::new()
$scenarioSemanticResolved = 0
foreach ($scenarioId in $scenarioOwnerContracts.Keys) {
    $contract = $scenarioOwnerContracts[$scenarioId]
    $owners = @($traceOwnersByScenario[$scenarioId])
    $contractValid = $true
    if ($traceStageByScenario[$scenarioId] -ne $contract.Stage) {
        Add-CheckError "Etapa semântica divergente em $scenarioId."
        $contractValid = $false
    }
    foreach ($requiredOwner in $contract.Required) {
        if ($requiredOwner -notin $owners) {
            Add-CheckError "Proprietário obrigatório $requiredOwner ausente em $scenarioId."
            $contractValid = $false
        }
    }
    foreach ($forbiddenOwner in $contract.Forbidden) {
        if ($forbiddenOwner -in $owners) {
            Add-CheckError "Proprietário incompatível $forbiddenOwner presente em $scenarioId."
            $contractValid = $false
        }
    }
    if ($contractValid) {
        $scenarioSemanticResolved++
    }
    else {
        [void]$semanticInvalidScenarios.Add($scenarioId)
    }
}
$compositeTraceResolved = @($compositeTraceResolvedIds | Where-Object {
    -not $semanticInvalidScenarios.Contains($_)
}).Count

$inventoryIds = @($inventory | ForEach-Object { $_[0] })
$visualIds = @($visual | ForEach-Object { $_[1] })
Assert-EqualSet 'inventário visual' $inventoryIds 'Documento 22B' $visualIds

foreach ($row in $visual) {
    if ($row[0] -ne "QAT-UI-$($row[1])") {
        Add-CheckError "Caso visual divergente para $($row[1])."
    }
    if ($row[5] -notmatch 'PAC-UI-01' -or $row[5] -notmatch 'PAC-ACE-01') {
        Add-CheckError "Pacotes visuais ausentes em $($row[0])."
    }
    if (@($row | Where-Object { [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        Add-CheckError "Campo vazio na linha visual $($row[0])."
    }
    if ($row[5] -match '(^|/)PAC-CAM-01($|/)' -and $row[6] -notmatch '(^|/)MASS-FLD($|/)') {
        Add-CheckError "Massa de campo ausente em $($row[0])."
    }
    if ($row[5] -match '(^|/)PAC-EMP-01($|/)' -and $row[6] -notmatch '(^|/)MASS-TEN($|/)') {
        Add-CheckError "Massa multiempresa ausente em $($row[0])."
    }
    $source = @($inventory | Where-Object { $_[0] -eq $row[1] })
    if ($source.Count -ne 1 -or $source[0][1] -ne $row[2] -or $source[0][2] -ne $row[3]) {
        Add-CheckError "Título/escopo visual divergente em $($row[0])."
    }
}

$u03 = @($visual | Where-Object { $_[1] -eq 'U03' })
if ($u03.Count -ne 1 -or $u03[0][5] -notmatch 'PAC-EMP-01' -or $u03[0][6] -notmatch '(^|/)MASS-TEN($|/)') {
    Add-CheckError 'U03 não contém a prova empresarial PAC-EMP-01/MASS-TEN.'
}

$doc17Lines = Get-Content -LiteralPath $paths.Doc17 -Encoding UTF8
$start = [Array]::IndexOf($doc17Lines, '### 12.4.3 Casos obrigatórios de teste do D30')
$end = [Array]::IndexOf($doc17Lines, '### 12.4.4 Regra monetária executável')
if ($start -lt 0 -or $end -le $start) {
    Add-CheckError 'Seção de casos D30 não localizada.'
}
else {
    $d30Rows = @($doc17Lines[($start + 1)..($end - 1)] | Where-Object {
        if (-not $_.StartsWith('|')) {
            return $false
        }
        $cells = Get-MarkdownCells -Line $_
        return $cells.Count -eq 5 -and $cells[0] -ne 'Caso' -and $cells[0] -notmatch '^---'
    })
    if ($d30Rows.Count -ne 24) {
        Add-CheckError "Documento 17 possui $($d30Rows.Count) vetores D30 em vez de 24."
    }
}

$generated = [string](& $paths.Generator)
$current = Get-Content -LiteralPath $paths.Doc22A -Raw -Encoding UTF8
$generatedNormalized = ($generated -replace "`r`n", "`n").TrimEnd()
$currentNormalized = ($current -replace "`r`n", "`n").TrimEnd()
if ($generatedNormalized -ne $currentNormalized) {
    Add-CheckError 'Documento 22A diverge de seu gerador determinístico.'
}

$doc22Text = Get-Content -LiteralPath $paths.Doc22 -Raw -Encoding UTF8
foreach ($term in @(
    'Documento 22A',
    'Documento 22B',
    'Documento 22C',
    'Documento 22D',
    '440',
    '119',
    '25 cenários compostos',
    '60 telas',
    'PostgreSQL real',
    'RPO',
    'RTO',
    'QAT-*',
    'PAC-UI-01',
    'PAC-ACE-01',
    'início das atividades dia 1 e admissão dia 15',
    'duas rodadas independentes com no mínimo 200 observações válidas por classe',
    'intervalo de confiança bootstrap de 95% da diferença das medianas'
)) {
    if (-not $doc22Text.Contains($term)) {
        Add-CheckError "Documento 22 não contém a referência obrigatória: $term"
    }
}
if ($doc22Text.Contains('início das atividades dia 1 e admissão dia 10')) {
    Add-CheckError 'Documento 22 ainda contém a variante obsoleta de admissão no dia 10.'
}

$doc17Text = Get-Content -LiteralPath $paths.Doc17 -Raw -Encoding UTF8
$doc18Text = Get-Content -LiteralPath $paths.Doc18 -Raw -Encoding UTF8
$doc20Text = Get-Content -LiteralPath $paths.Doc20 -Raw -Encoding UTF8
$meiTerminalCutContracts = @(
    @{
        Name = 'Documento Mestre'
        Text = $masterText
        Terms = @('Se o contrato encerrar antes ou na data prevista do adiantamento e ele ainda não tiver sido pago, toda a base proporcional vai para o pagamento final.')
    },
    @{
        Name = 'Documento 17'
        Text = $doc17Text
        Terms = @('fim aplicável <= data prevista do adiantamento', 'inclui adiantamento MEI zerado pela regra terminal da seção 10.3', 'redirecionamento terminal da seção 10.3')
    },
    @{
        Name = 'Documento 18'
        Text = $doc18Text
        Terms = @('fim_aplicavel <= data_prevista_adiantamento', 'origem obrigatória de valor zero', 'nenhum pagamento/recibo de adiantamento pode ser criado')
    },
    @{
        Name = 'Documento 20'
        Text = $doc20Text
        Terms = @('redirecionamento terminal da base MEI', 'API-GRP-003` deve calcular o adiantamento devido como zero', 'sem pagamento, numeração ou recibo')
    },
    @{
        Name = 'Documento 21'
        Text = $doc21Text
        Terms = @('os dois cortes do MEI', 'fim_aplicavel <= data_prevista_adiantamento', 'o grupo de adiantamento calcula zero, fica não aplicável, não gera recibo')
    },
    @{
        Name = 'Documento 22D'
        Text = $doc22DText
        Terms = @('grupo de adiantamento tem valor devido zero e fica `Não aplicável`', 'R$ 1.100,00 + serviço adicional integral R$ 200,00 = R$ 1.300,00', 'TST-B05-CON-05/TST-G08-03/TST-G08-07/TST-R11-02')
    }
)
$meiTerminalCutResolved = 0
foreach ($contract in $meiTerminalCutContracts) {
    $contractValid = $true
    foreach ($term in $contract.Terms) {
        if (-not $contract.Text.Contains($term)) {
            Add-CheckError "$($contract.Name) não propagou a regra terminal do adiantamento MEI: $term"
            $contractValid = $false
        }
    }
    if ($contractValid) {
        $meiTerminalCutResolved++
    }
}

$packageReferenceContracts = @(
    @{ Name = 'Documento 22'; Text = $doc22Text; Terms = @('Documento 22D', '25 cenários compostos') },
    @{ Name = 'Documento 22C'; Text = $doc22CText; Terms = @('22D', '25 cenários compostos') },
    @{ Name = 'Documento Mestre'; Text = $masterText; Terms = @('Documento 22D', '25 cenários compostos obrigatórios') }
)
foreach ($contract in $packageReferenceContracts) {
    foreach ($term in $contract.Terms) {
        if (-not $contract.Text.Contains($term)) {
            Add-CheckError "$($contract.Name) não contém o vínculo obrigatório: $term"
        }
    }
}

$statusDeclarationsValid = $true
foreach ($contract in @(
    @{
        Name = 'Documento 22'
        Text = $doc22Text
        Terms = @('aprovado integralmente pelo usuário', 'PlanningReady = true', 'NOT_RUN_PLANNED', 'ReleaseCandidateReady = false', '**Estado na data da aprovação:** o código de produção ainda não havia sido iniciado.', '**Checkpoint posterior:** a implementação da baseline `ETP-00` está registrada em `docs/ETP-00.md`; nenhuma implantação de produção foi iniciada.')
    },
    @{
        Name = 'Documento 22D'
        Text = $doc22DText
        Terms = @('aprovados pelo usuário', '**Continuidade na data da aprovação:**', '**Checkpoint posterior:** baseline em implementação controlada conforme `docs/ETP-00.md`')
    },
    @{
        Name = 'Documento Mestre'
        Text = $masterText
        Terms = @('Os gates formais de execução ainda não foram concluídos', 'sistema não está liberado para produção', 'checkpoint posterior registra essa baseline em implementação controlada em `docs/ETP-00.md`')
    }
)) {
    foreach ($term in $contract.Terms) {
        if (-not $contract.Text.Contains($term)) {
            Add-CheckError "$($contract.Name) não contém a declaração de fase: $term"
            $statusDeclarationsValid = $false
        }
    }
}
$executionGateStatus = if ($statusDeclarationsValid) { 'NOT_RUN_PLANNED' } else { 'DOCUMENT_STATUS_INCONSISTENT' }
$releaseCandidateReady = $errors.Count -eq 0 -and $executionGateStatus -eq 'PASSED'

$result = [ordered]@{
    FunctionalRows = $rows22.Count
    FunctionalUnique = @($ids22 | Sort-Object -Unique).Count
    AsoProjectionRules = $asoRules.Count
    Suites = $expectedSuites.Count
    VisualRows = $visual.Count
    VisualUnique = @($visualIds | Sort-Object -Unique).Count
    A11YRootCases = $a11yRoots.Count
    A11YProjectedResults = $a11yProjectedResults
    TechnicalRows = $technical.Count
    TechnicalUnique = @($technicalIds | Sort-Object -Unique).Count
    TechnicalTraceRules = $traceRules.Count
    TechnicalTraceResolved = $technicalTraceResolved
    ThreatOwners = $threatOwnersResolved
    D30GoldenVectors = if ($start -ge 0 -and $end -gt $start) { $d30Rows.Count } else { 0 }
    CompositeScenarios = $scenarioMatches.Count
    CompositeUnique = @($scenarioIds | Sort-Object -Unique).Count
    CompositeTraceRows = $compositeTrace.Count
    CompositeTraceResolved = $compositeTraceResolved
    CompositeSemanticContracts = $scenarioOwnerContracts.Count
    CompositeSemanticResolved = $scenarioSemanticResolved
    MeiTerminalCutAuthorities = $meiTerminalCutContracts.Count
    MeiTerminalCutResolved = $meiTerminalCutResolved
    AsvsSha256 = $actualAsvsHash
    AsvsRequirements = $asvsRequirements.Count
    AsvsUniqueIds = $asvsUniqueIds.Count
    AsvsLevel1 = $asvsL1.Count
    GeneratorMatches = $generatedNormalized -eq $currentNormalized
    PlanningReady = $errors.Count -eq 0
    PlanningErrors = $errors.Count
    ExecutionGateStatus = $executionGateStatus
    ReleaseCandidateReady = $releaseCandidateReady
    Errors = $errors.Count
}

$result | ConvertTo-Json

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}
