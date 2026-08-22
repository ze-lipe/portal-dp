[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$paths = [ordered]@{
    Doc23  = Join-Path $PSScriptRoot '23-implantacao-migracao-inicial-operacao-retorno-seguro.md'
    Doc23A = Join-Path $PSScriptRoot '23a-registro-parametros-responsaveis-prontidao.md'
    Doc23B = Join-Path $PSScriptRoot '23b-caderno-carga-inicial-reconciliacao.md'
    Doc23C = Join-Path $PSScriptRoot '23c-runbook-virada-go-no-go-retorno-seguro.md'
    Doc23D = Join-Path $PSScriptRoot '23d-catalogo-operacao-backup-incidentes.md'
    Doc17  = Join-Path $PSScriptRoot '17-matriz-formal-estados-transicoes.md'
    Doc18  = Join-Path $PSScriptRoot '18-modelo-logico-dados-relacionamentos-restricoes.md'
    Doc18A = Join-Path $PSScriptRoot '18a-matriz-rastreabilidade-transicoes.md'
    Doc19  = Join-Path $PSScriptRoot '19-arquitetura-tecnica-seguranca-infraestrutura-backup-observabilidade.md'
    Doc20  = Join-Path $PSScriptRoot '20-contratos-api-matriz-tecnica-autorizacao.md'
    Doc20A = Join-Path $PSScriptRoot '20a-matriz-rastreabilidade-api-autorizacao-transicoes.md'
    Doc21  = Join-Path $PSScriptRoot '21-backlog-priorizado-plano-desenvolvimento-etapas.md'
    Doc21A = Join-Path $PSScriptRoot '21a-matriz-rastreabilidade-backlog-etapas.md'
    Doc22  = Join-Path $PSScriptRoot '22-estrategia-testes-homologacao-rastreabilidade.md'
    Doc22A = Join-Path $PSScriptRoot '22a-matriz-executavel-casos-perfis-evidencias.md'
    Doc22B = Join-Path $PSScriptRoot '22b-matriz-conformidade-60-telas-subfluxos.md'
    Doc22C = Join-Path $PSScriptRoot '22c-inventario-executavel-testes-tecnicos-asvs.md'
    Doc22D = Join-Path $PSScriptRoot '22d-caderno-25-cenarios-compostos.md'
    Master = Join-Path $PSScriptRoot '07-documento-mestre-planejamento-funcional.md'
}

$errors = New-Object 'System.Collections.Generic.List[string]'

function Add-CheckError([string]$message) {
    $errors.Add($message)
}

foreach ($entry in $paths.GetEnumerator()) {
    if (-not (Test-Path -LiteralPath $entry.Value)) {
        Add-CheckError "Missing file: $($entry.Key) -> $($entry.Value)"
    }
}

if ($errors.Count -gt 0) {
    [ordered]@{ DocumentValid = $false; D23PlanningReady = $false; Errors = @($errors) } | ConvertTo-Json -Depth 8
    exit 1
}

$text = @{}
foreach ($entry in $paths.GetEnumerator()) {
    $text[$entry.Key] = [System.IO.File]::ReadAllText($entry.Value)
}

$approved = [regex]::IsMatch($text.Doc23, '(?m)^> \*\*Status:\*\* aprovado integralmente')
$pendingApproval = [regex]::IsMatch($text.Doc23, '(?m)^> \*\*Status:\*\* conclu.do e revisado internamente; aguardando aprova')

function Assert-Terms([string]$name, [string]$content, [string[]]$terms) {
    foreach ($term in $terms) {
        if (-not $content.Contains($term)) {
            Add-CheckError "$name is missing required term: $term"
        }
    }
}

function Assert-RowTerms([string]$name, [string]$content, [string]$rowId, [string[]]$terms) {
    $pattern = '(?m)^\|\s*`?' + [regex]::Escape($rowId) + '`?\s*\|(?<row>.*)$'
    $matches = @([regex]::Matches($content, $pattern))
    if ($matches.Count -ne 1) {
        Add-CheckError "$name must define exactly one row for $rowId; found $($matches.Count)."
        return
    }
    Assert-Terms "$name/$rowId" $matches[0].Value $terms
}

function Assert-SectionTerms(
    [string]$name,
    [string]$content,
    [string]$startMarker,
    [string]$endMarker,
    [string[]]$terms
) {
    $start = $content.IndexOf($startMarker, [StringComparison]::Ordinal)
    if ($start -lt 0) {
        Add-CheckError "$name is missing section marker: $startMarker"
        return
    }
    $end = if ([string]::IsNullOrEmpty($endMarker)) {
        $content.Length
    }
    else {
        $candidate = $content.IndexOf($endMarker, $start + $startMarker.Length, [StringComparison]::Ordinal)
        if ($candidate -lt 0) { $content.Length } else { $candidate }
    }
    Assert-Terms $name $content.Substring($start, $end - $start) $terms
}

function Get-DefinitionIds([string]$content, [string]$prefix, [int]$digits = 3) {
    $pattern = '(?m)^\|\s*`(?<id>' + [regex]::Escape($prefix) + '-\d{' + $digits + '})`\s*\|'
    return @([regex]::Matches($content, $pattern) | ForEach-Object { $_.Groups['id'].Value })
}

function Assert-Sequence([string]$name, [string[]]$actual, [string]$prefix, [int]$first, [int]$last, [int]$digits = 3) {
    $format = '0' * $digits
    $expected = @($first..$last | ForEach-Object { '{0}-{1}' -f $prefix, $_.ToString($format) })
    $unique = @($actual | Sort-Object -Unique)
    $duplicates = @($actual | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
    $missing = @($expected | Where-Object { $_ -notin $unique })
    $extra = @($unique | Where-Object { $_ -notin $expected })
    if ($duplicates.Count -gt 0) { Add-CheckError "$name has duplicate definition IDs: $($duplicates -join ', ')" }
    if ($missing.Count -gt 0) { Add-CheckError "$name has missing IDs: $($missing -join ', ')" }
    if ($extra.Count -gt 0) { Add-CheckError "$name has unexpected IDs: $($extra -join ', ')" }
}

function Assert-MarkdownTables([string]$name, [string]$content) {
    $expectedPipes = $null
    $lineNumber = 0
    foreach ($line in ($content -split "`r?`n")) {
        $lineNumber++
        if ($line -match '^\|.*\|\s*$') {
            $pipeCount = ([regex]::Matches($line, '\|')).Count
            if ($null -eq $expectedPipes) {
                $expectedPipes = $pipeCount
            }
            elseif ($pipeCount -ne $expectedPipes) {
                Add-CheckError "$name table column mismatch at line ${lineNumber}: expected $expectedPipes pipes, found $pipeCount"
            }
        }
        else {
            $expectedPipes = $null
        }
    }
}

function Convert-ToAsciiLower([string]$value) {
    $formD = $value.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object Text.StringBuilder
    foreach ($character in $formD.ToCharArray()) {
        $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($character)
        if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($character)
        }
    }
    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC).ToLowerInvariant()
}

Assert-Terms 'Doc23' $text.Doc23 @(
    'Documento 23A', 'Documento 23B', 'Documento 23C', 'Documento 23D',
    'CutoverReady = false', 'ProductionGo = false', 'NOT_RUN_PLANNED',
    'IMP-DRY-019', 'RDY-OPS', 'RBK-031', 'manifesto restrito', 'bootstrap consumido/desabilitado',
    'nenhum dado real antes de `MAR-06`', 'MF-01', 'manifesto_carga_id',
    'FECHADO_RECONCILIADO', 'ENT-IMP-01/02/03/04/05', 'production_go_id', 'ReleaseCandidateReady', 'CTL-IMP-001', 'CTL-IMP-004',
    'INVALIDADO_EXIGE_NOVA_TENTATIVA', 'SEMENTE_EXISTENTE_VERIFICADA',
    'T_GO', 'authority_switched_at = T_RET', 'authority_switched_at = T_REENT', 'registro_externo_autoridade'
)

Assert-Terms 'Doc23A' $text.Doc23A @(
    'PRM-032', 'ciclo_aplicacao_id', 'CUT-EMP-01', 'CUT-EMP-03', 'WIN-004', 'DEC-001', 'DEC-004',
    'OWN-001', 'OWN-015', 'ROL-MST', 'HML-001', 'HML-007', 'SRC-001', 'SRC-009', 'RDY-OPS', 'RDY-GO',
    'ENT-IMP-03', 'API-REC-009'
)

Assert-Terms 'Doc23B' $text.Doc23B @(
    'IMP-DRY-001', 'IMP-DRY-024', 'IMP-DAT-001', 'IMP-DAT-028',
    'bootstrap consumido/desabilitado', 'manifesto restrito', 'baseline autorizado', 'SRC-005/006/009',
    'PRONTO_AGUARDANDO_PAR', 'FECHADO_AGUARDANDO_RECONCILIACAO', 'zero efeito auditado',
    'tentativa_carga_id', 'ciclo_aplicacao_id', 'INVALIDADO_EXIGE_NOVA_TENTATIVA', 'production_go_id', 'entrada_ativa', 'CTL-IMP-001'
)

Assert-Terms 'Doc23C' $text.Doc23C @(
    'Todos os 28 itens precisam estar', 'CutoverReady = true', 'RDY-OPS',
    'IMP-CUT-018', 'IMP-RET-010', 'PRM-028', 'ProductionGo = false',
    'FECHADO_AGUARDANDO_RECONCILIACAO', 'INVALIDADO_EXIGE_NOVA_TENTATIVA',
    'CTL-IMP-002', 'CTL-IMP-003', 'CTL-IMP-004', 'production_go_id', 'SEMENTES_RESOLVIDAS', 'T-14', 'T-10', 'T-7', 'IMP-CUT-015'
)

Assert-Terms 'Doc23D' $text.Doc23D @(
    'RBK-001', 'RBK-031', 'OPS-JOB-001', 'OPS-JOB-020', 'DSH-001', 'DSH-009',
    'ALT-001', 'ALT-015', 'REC-001', 'REC-020', 'RDY-OPS', 'conta/projeto',
    'integridade prevalece sobre o RPO', 'REC-017', 'perda residual', 'authority_switched_at = T_REENT'
)

Assert-Terms 'Doc18 implementation authority' $text.Doc18 @(
    'ENT-IMP-01', 'ENT-IMP-02', 'ENT-IMP-03', 'ENT-IMP-04', 'ENT-IMP-05', 'REL-IMP-01', 'REL-IMP-02', 'REL-IMP-03', 'REL-IMP-04',
    'EST-IMP-MF-01', 'EST-IMP-EA-05', 'EST-IMP-GA-03', 'entrada_ativa', 'production_go_id', 'RST-GER-32', 'manifesto_carga_empresa_ano_id',
    '| RST-GER-32 | Existe', 'ProductionGo'
)

Assert-Terms 'Doc18A technical roots' $text.Doc18A @(
    '## 6.1', 'ENT-AUT-14', 'ENT-IMP-01/02/03/04/05', 'REL-IMP-01/02/03/04',
    'CTL-BST-001', 'CTL-IMP-001', 'QAT-REC-007'
)

Assert-Terms 'Doc19 current program baseline' $text.Doc19 @(
    'Documentos 20, 21 e 22', 'est', 'aprovados integralmente', 'Documento 23', 'Retorno Seguro', 'ETP-00',
    'D23PlanningReady', 'CutoverReady', 'ProductionGo'
)
if ($text.Doc19.Contains('Documento 20, futuramente')) {
    Add-CheckError 'Doc19 still describes Document 20 as future.'
}
if ((Convert-ToAsciiLower $text.Doc19).Contains('implantacao, migracao, operacao e reversao')) {
    Add-CheckError 'Doc19 contains the obsolete Document 23 title with Reversao.'
}

Assert-Terms 'Doc20 manifest control plane' $text.Doc20 @(
    'manifesto_carga_empresa_ano_id', 'CTL-IMP-001', 'CTL-IMP-002', 'CTL-IMP-003', 'CTL-IMP-004',
    'entradas empresa+ano ordenadas', 'guarda/raiz empresa+ano ordenada',
    'Manifesto reconciliado sem `GO`', 'entrada_ativa BOOLEAN NOT NULL DEFAULT TRUE', 'ENT-IMP-04', 'ProductionGo'
)

Assert-Terms 'Doc20A synchronized technical roots' $text.Doc20A @(
    'ENT-IMP-01/02/03/04/05', 'REL-IMP-01/02/03/04', 'authority_epoch'
)

Assert-Terms 'Doc21 operational bridges' $text.Doc21 @(
    'BK-077 | Implementar, como item', 'sem entrega parcial de `BK-063/064/066`',
    'ENT-IMP-01/02/03/04/05', 'corrida fechamento', 'ProductionGo', 'CTL-IMP-001'
)
Assert-RowTerms 'Doc21 ordered migration backlog' $text.Doc21 'BK-371' @(
    'CTL-IMP-001/PREPARAR', 'PROMOVER', 'manifesto `APROVADO`', 'somente ent', 'MIGRACAO_PRE_GO'
)

Assert-Terms 'Doc21A exact BK077 subgraph' $text.Doc21A @(
    'BK-077', 'BK-004, BK-027, BK-041, BK-077',
    'BK-010, BK-011, BK-063', 'todo o DAG dos 253 itens'
)

Assert-Terms 'Doc22C operational proofs' $text.Doc22C @(
    'fechamento', 'primeira', 'ENT-IMP-05', 'authority_epoch', '004/027/041/077',
    'reconstruir/reconciliar por evid'
)

Assert-RowTerms 'Doc18 authority entity' $text.Doc18 'ENT-IMP-05' @(
    'evento_inelegibilidade_manifesto', 'Append-only', 'CTL-IMP-004(INVALIDAR_GO)', 'IMP-CUT-018'
)
Assert-RowTerms 'Doc18 manifest invariant' $text.Doc18 'RST-GER-32' @(
    'entrada_ativa BOOLEAN NOT NULL DEFAULT TRUE', 'encerrada_em IS NULL', 'ENT-IMP-05',
    'ledger_conteudo_versao/hash', 'reconciliacao_ledger_versao/hash', 'authority_epoch', 'delta', '`GO`'
)
Assert-RowTerms 'Doc18 first real receipt root' $text.Doc18 'ENT-REC-01' @(
    'primeira faixa', 'reconciliada'
)
Assert-RowTerms 'Doc18 first real receipt invariant' $text.Doc18 'RST-GER-16' @(
    'PENDENTE_RECONCILIACAO', 'CTL-REC-001', 'RECONCILIADA', 'bloqueia'
)
Assert-RowTerms 'Doc18 first range state' $text.Doc18 'EST-REC-PF-01' @(
    'NAO_EXIGIDA', 'terminal operacional', 'Nunca converter'
)
Assert-RowTerms 'Doc18 first range state' $text.Doc18 'EST-REC-PF-02' @(
    'AGUARDANDO_EMISSAO', 'PENDENTE_RECONCILIACAO', 'Primeiro commit'
)
Assert-RowTerms 'Doc18 first range state' $text.Doc18 'EST-REC-PF-03' @(
    'PENDENTE_RECONCILIACAO', 'CTL-REC-001', 'RBK-018', 'sem desbloqueio manual'
)
Assert-RowTerms 'Doc18 first range state' $text.Doc18 'EST-REC-PF-04' @(
    'RECONCILIADA', 'terminal operacional', 'Nunca retornar'
)
Assert-SectionTerms 'Doc18 manifest authority section' $text.Doc18 '## 33.5 ' '# 34.' @(
    'CTL-IMP-001/PREPARAR', 'CTL-IMP-001/DECIDIR_ESCOPO', 'CTL-IMP-001/PROMOVER',
    'CTL-IMP-003/DECIDIR_FINAL', 'CTL-IMP-003/FINALIZAR', 'CTL-IMP-004(INVALIDAR_GO)',
    'ledger_conteudo_versao/hash', 'reconciliacao_ledger_versao/hash', 'authority_epoch',
    'MIGRACAO_PRE_GO', 'proximo_numero_interno_projetado', 'ENT-IMP-05'
)

Assert-RowTerms 'Doc20 control command' $text.Doc20 'CTL-IMP-001' @(
    'PREPARAR', 'DECIDIR_ESCOPO', 'PROMOVER', 'escopo_versao/hash', 'ENT-IMP-03', 'append-only'
)
Assert-RowTerms 'Doc20 control command' $text.Doc20 'CTL-IMP-003' @(
    'DECIDIR_FINAL', 'FINALIZAR', 'candidato_final_versao/hash', 'ledger_conteudo_versao/hash',
    'mesmo decisor', 'ciclo/hash antigo'
)
Assert-RowTerms 'Doc20 control command' $text.Doc20 'CTL-IMP-004' @(
    'reconciliacao_ledger_versao/hash', 'INVALIDAR_GO', 'ENT-IMP-05', 'FECHADO_RECONCILIADO'
)
Assert-RowTerms 'Doc20 first real receipt command' $text.Doc20 'CTL-REC-001' @(
    'RBK-018', 'PENDENTE_RECONCILIACAO', 'RECONCILIADA', 'primeira faixa'
)
Assert-RowTerms 'Doc20 concurrency proof' $text.Doc20 'TST-API-010' @(
    'delta', '`GO`', 'entrada_ativa = NULL', 'FALSE', 'ENT-IMP-05', 'IMP-CUT-018', '[T_RET,T_REENT)', 'authority'
)

Assert-RowTerms 'Doc22C concurrency proof' $text.Doc22C 'TST-API-010' @(
    'delta', '`GO`', 'entrada_ativa = NULL', 'FALSE', 'ENT-IMP-05', 'IMP-CUT-018', '[T_RET,T_REENT)'
)
Assert-RowTerms 'Doc22C recovery proof' $text.Doc22C 'QAT-REC-007' @(
    'ENT-IMP-01/02/03/04/05', 'append-only', 'ENT-IMP-05', 'fence', 'delta', '`GO`',
    '[T_RET,T_REENT)', 'handoff', 'PENDENTE_RECONCILIACAO', 'CTL-REC-001'
)

Assert-RowTerms 'Doc23B return rehearsal' $text.Doc23B 'IMP-DRY-019' @(
    'RBK-018', 'T_RET', 'T_REENT', 'authority_epoch', '[T_RET,T_REENT)', 'lacunas'
)
Assert-RowTerms 'Doc23B manifest rehearsal' $text.Doc23B 'IMP-DRY-020' @(
    'delta', '`GO`', 'fence', 'ENT-IMP-05', 'INVALIDAR_GO', 'rejeita', 'fluxo normal do sistema', 'CAS', 'ACK'
)
Assert-RowTerms 'Doc23B manifest preparation order' $text.Doc23B 'IMP-DAT-007' @(
    'CTL-IMP-001/PREPARAR', 'PROMOVER', 'manifesto', 'APROVADO', 'nenhuma capacidade'
)
Assert-RowTerms 'Doc23B migration capability order' $text.Doc23B 'IMP-DAT-008' @(
    'manifesto', 'APROVADO', 'MIGRACAO_PRE_GO'
)

Assert-RowTerms 'Doc23A external authority register' $text.Doc23A 'PRM-012' @(
    'registro_externo_autoridade', 'CAS', 'T_GO', 'T_RET', 'T_REENT'
)
Assert-RowTerms 'Doc23A source fence plan' $text.Doc23A 'PRM-031' @(
    'SRC-*', 'ACK', 'drenagem', 'reabertura'
)

Assert-RowTerms 'Doc23C atomic go' $text.Doc23C 'IMP-CUT-018' @(
    'fence', 'FECHADO_RECONCILIADO', 'go_elegivel', 'ENT-IMP-05', 'production_go_id',
    'authority_epoch', 'CAS', 'T_GO', 'registro externo', 'proje'
)
Assert-RowTerms 'Doc23C source fence acknowledgements' $text.Doc23C 'IMP-CUT-017' @(
    'SRC-001', '009', 'ACK', 'mesma gera'
)
Assert-RowTerms 'Doc23C numeric handoff' $text.Doc23C 'IMP-RET-009' @(
    'RBK-018', 'reservas/incertos', 'lacunas', 'ledger', 'T_RET', 'CAS'
)
Assert-RowTerms 'Doc23C numeric reentry' $text.Doc23C 'IMP-RET-010' @(
    'T_REENT', 'lacunas', 'raiz', 'seed', 'CAS'
)
Assert-RowTerms 'Doc23C first real receipt fence' $text.Doc23C 'IMP-HYP-006' @(
    'PENDENTE_RECONCILIACAO', 'CTL-REC-001', 'RECONCILIADA', 'antes da pr'
)
Assert-SectionTerms 'Doc23C pre and post CAS failure branches' $text.Doc23C '## 6.1 ' '## 6.2 ' @(
    'somente enquanto o CAS externo de `T_GO` ainda n',
    'confirmar no `registro_externo_autoridade` que n',
    'Depois que o CAS de `T_GO` confirma', 'reabertura silenciosa', 'NO-GO', 'RBK-020', 'T_RET'
)

Assert-RowTerms 'Doc23D restore authority' $text.Doc23D 'REC-018' @(
    'cadeia comprovada', 'controle anterior+ledger', 'RBK-020', 'T_REENT'
)
Assert-RowTerms 'Doc23D numbering runbook' $text.Doc23D 'RBK-018' @(
    'primeira', 'resposta incerta', 'T_RET/T_REENT', 'reservados/incertos', 'zero reuso'
)
Assert-RowTerms 'Doc23D restored authority projection' $text.Doc23D 'REC-011' @(
    'CAS externo', 'ENT-IMP-04', 'authority'
)
Assert-SectionTerms 'Doc23D first real receipt procedure' $text.Doc23D '# 12. ' '# 13. ' @(
    'No primeiro recibo', 'empresa+ano', 'fenceada', 'RBK-018', 'PENDENTE_RECONCILIACAO',
    'CTL-REC-001', 'RECONCILIADA', 'RBK-025'
)
Assert-SectionTerms 'Doc23D fail closed authority protocol' $text.Doc23D '## 10.1 ' '## 10.2 ' @(
    'fail-closed', 'registro_externo_autoridade', 'CAS', 'antes do CAS', 'depois do CAS',
    'app/banco', 'T_RET', 'T_REENT', 'ENT-IMP-04'
)

Assert-Terms 'Doc22 approval' $text.Doc22 @(
    'aprovado integralmente pelo usu', 'PlanningReady = true', 'NOT_RUN_PLANNED', 'ReleaseCandidateReady = false'
)

if ($text.Doc22.Contains('ReleaseReady')) {
    Add-CheckError 'Doc22 contains obsolete ReleaseReady; use ReleaseCandidateReady.'
}

Assert-Terms 'Master baseline' $text.Master @(
    'pacote 22/22A', 'pacote 23/23A', 'Os gates formais de execu', 'checkpoint posterior registra essa baseline em implementação controlada em `docs/ETP-00.md`'
)

if (-not $approved -and -not $pendingApproval) {
    Add-CheckError 'Doc23 status must be either pending user approval or fully approved.'
}
if ($approved -and $pendingApproval) {
    Add-CheckError 'Doc23 approval states are mutually exclusive; approved and pending cannot coexist.'
}

$annexNames = @('Doc23A','Doc23B','Doc23C','Doc23D')
if ($approved) {
    if (-not $text.Doc23.Contains('D23PlanningReady = true') -or $text.Doc23.Contains('D23PlanningReady = false')) {
        Add-CheckError 'Approved Doc23 must declare D23PlanningReady = true and must not retain the false declaration.'
    }
    foreach ($annexName in $annexNames) {
        if (-not [regex]::IsMatch($text[$annexName], '(?m)^> \*\*Status:\*\* aprovado integralmente')) {
            Add-CheckError "$annexName must be marked fully approved when Doc23 is approved."
        }
        if ($text[$annexName] -match '(?i)aguardando aprova') {
            Add-CheckError "$annexName cannot retain pending approval wording after approval."
        }
    }
    if ($text.Doc23 -match '(?i)aguardando aprova') {
        Add-CheckError 'Approved Doc23 cannot retain pending approval wording.'
    }
    if ($text.Master -match '(?is)pacote (?:do )?Documento 23.*?aguardando aprova|pacote 23/23A.?23D.*?aguardando aprova') {
        Add-CheckError 'Master cannot retain pending Document 23 wording after approval.'
    }
    foreach ($syncName in @('Doc18','Doc18A','Doc19','Doc20','Doc20A','Doc21','Doc21A','Doc22','Doc22A','Doc22B','Doc22C','Doc22D','Master')) {
        if ($text[$syncName] -match '(?im)^[^\r\n]*(?:pacote (?:do )?Documento 23|pacote 23(?:/23A.?23D)?)[^\r\n]*(?:aguardando[^\r\n]*aprova|sujeit[oa][^\r\n]*aprova|em aprova)') {
            Add-CheckError "$syncName retains a pending Document 23 synchronization statement after approval."
        }
    }
    if ($text.Master -notmatch '(?i)pacote (?:do )?Documento 23|pacote 23/23A') {
        Add-CheckError 'Master baseline is missing the Document 23 package.'
    }
    elseif ($text.Master -notmatch '(?is)pacote (?:do )?Documento 23.*?aprovado integralmente|pacote 23/23A.?23D aprovado') {
        Add-CheckError 'Master baseline must record the Document 23 package as approved.'
    }
}
elseif ($pendingApproval) {
    if (-not $text.Doc23.Contains('D23PlanningReady = false') -or $text.Doc23.Contains('D23PlanningReady = true')) {
        Add-CheckError 'Pending Doc23 must declare D23PlanningReady = false and must not declare it true.'
    }
    foreach ($annexName in $annexNames) {
        if (-not [regex]::IsMatch($text[$annexName], '(?m)^> \*\*Status:\*\* conclu.do e revisado internamente; aguardando aprova')) {
            Add-CheckError "$annexName must remain pending while Doc23 awaits approval."
        }
        if ([regex]::IsMatch($text[$annexName], '(?m)^> \*\*Status:\*\* aprovado integralmente')) {
            Add-CheckError "$annexName cannot be both pending and approved."
        }
    }
    if ([regex]::IsMatch($text.Doc23, '(?m)^> \*\*Status:\*\* aprovado integralmente')) {
        Add-CheckError 'Pending Doc23 cannot also contain an approved status line.'
    }
    if ($text.Master -match '(?im)^\*\*Situa..o:\*\*[^\r\n]*pacote 23/23A.?23D[^\r\n]*aprovado|(?i)pacote do Documento 23[^\r\n]{0,300}aprovado integralmente') {
        Add-CheckError 'Master cannot mark Document 23 approved while the package is pending.'
    }
    if ($text.Master -notmatch '(?is)pacote (?:do )?Documento 23.*?aguardando aprova|pacote 23/23A.?23D conclu.do.*?aguardando aprova') {
        Add-CheckError 'Master baseline must record the Document 23 package as awaiting approval.'
    }
}

$rq = Get-DefinitionIds $text.Doc23 'D23-RQ' 2
Assert-Sequence 'Doc23/D23-RQ' $rq 'D23-RQ' 1 20 2

$prm = Get-DefinitionIds $text.Doc23A 'PRM'
$cutEmp = Get-DefinitionIds $text.Doc23A 'CUT-EMP' 2
$win = Get-DefinitionIds $text.Doc23A 'WIN'
$dec = Get-DefinitionIds $text.Doc23A 'DEC'
$own = Get-DefinitionIds $text.Doc23A 'OWN'
$hml = Get-DefinitionIds $text.Doc23A 'HML'
$src = Get-DefinitionIds $text.Doc23A 'SRC'
Assert-Sequence 'Doc23A/PRM' $prm 'PRM' 1 32
Assert-Sequence 'Doc23A/CUT-EMP' $cutEmp 'CUT-EMP' 1 3 2
Assert-Sequence 'Doc23A/WIN' $win 'WIN' 1 4
Assert-Sequence 'Doc23A/DEC' $dec 'DEC' 1 4
Assert-Sequence 'Doc23A/OWN' $own 'OWN' 1 15
Assert-Sequence 'Doc23A/HML' $hml 'HML' 1 7
Assert-Sequence 'Doc23A/SRC' $src 'SRC' 1 9

$expectedRdy = @('RDY-PLAN','RDY-BUILD','RDY-ENV','RDY-PEOPLE','RDY-DATA','RDY-REC','RDY-SEC','RDY-RC','RDY-OPS','RDY-CUT','RDY-GO')
$rdy = @([regex]::Matches($text.Doc23A, '(?m)^\|\s*`(?<id>RDY-[A-Z]+)`\s*\|') | ForEach-Object { $_.Groups['id'].Value })
$uniqueRdy = @($rdy | Sort-Object -Unique)
if ($uniqueRdy.Count -ne $expectedRdy.Count -or @($expectedRdy | Where-Object { $_ -notin $uniqueRdy }).Count -gt 0) {
    Add-CheckError 'Doc23A does not contain the exact expected RDY gate set.'
}

$dry = Get-DefinitionIds $text.Doc23B 'IMP-DRY'
$impSrc = Get-DefinitionIds $text.Doc23B 'IMP-SRC'
$dat = Get-DefinitionIds $text.Doc23B 'IMP-DAT'
Assert-Sequence 'Doc23B/IMP-DRY' $dry 'IMP-DRY' 1 24
Assert-Sequence 'Doc23B/IMP-SRC' $impSrc 'IMP-SRC' 1 10
Assert-Sequence 'Doc23B/IMP-DAT' $dat 'IMP-DAT' 1 28

$pre = Get-DefinitionIds $text.Doc23C 'IMP-PRE'
$cut = Get-DefinitionIds $text.Doc23C 'IMP-CUT'
$gng = Get-DefinitionIds $text.Doc23C 'IMP-GNG'
$smk = Get-DefinitionIds $text.Doc23C 'IMP-SMK'
$ret = Get-DefinitionIds $text.Doc23C 'IMP-RET'
$hyp = Get-DefinitionIds $text.Doc23C 'IMP-HYP'
Assert-Sequence 'Doc23C/IMP-PRE' $pre 'IMP-PRE' 1 14
Assert-Sequence 'Doc23C/IMP-CUT' $cut 'IMP-CUT' 1 27
Assert-Sequence 'Doc23C/IMP-GNG' $gng 'IMP-GNG' 1 28
Assert-Sequence 'Doc23C/IMP-SMK' $smk 'IMP-SMK' 1 11
Assert-Sequence 'Doc23C/IMP-RET' $ret 'IMP-RET' 1 10
Assert-Sequence 'Doc23C/IMP-HYP' $hyp 'IMP-HYP' 1 8

$gngLines = @($text.Doc23C -split "`r?`n" | Where-Object { $_ -match '^\|\s*`IMP-GNG-' })
if (@($gngLines | Where-Object { $_ -notmatch 'N.O_INICIADO' }).Count -gt 0) {
    Add-CheckError 'Every GO/NO-GO check must start in the NOT_STARTED state.'
}
if (@($gngLines | Where-Object { $_ -match 'N.O_APLIC.VEL' }).Count -gt 0) {
    Add-CheckError 'GO/NO-GO checks cannot use a NOT_APPLICABLE state.'
}

$rbk = Get-DefinitionIds $text.Doc23D 'RBK'
$opsJob = Get-DefinitionIds $text.Doc23D 'OPS-JOB'
$dsh = Get-DefinitionIds $text.Doc23D 'DSH'
$alt = Get-DefinitionIds $text.Doc23D 'ALT'
$rec = Get-DefinitionIds $text.Doc23D 'REC'
Assert-Sequence 'Doc23D/RBK' $rbk 'RBK' 1 31
Assert-Sequence 'Doc23D/OPS-JOB' $opsJob 'OPS-JOB' 1 20
Assert-Sequence 'Doc23D/DSH' $dsh 'DSH' 1 9
Assert-Sequence 'Doc23D/ALT' $alt 'ALT' 1 15
Assert-Sequence 'Doc23D/REC' $rec 'REC' 1 20

$packageText = ($text.Doc23, $text.Doc23A, $text.Doc23B, $text.Doc23C, $text.Doc23D) -join "`n"
$ownedPattern = '(?m)^\|\s*`(?<id>(?:D23-RQ|PRM|CUT-EMP|WIN|DEC|OWN|HML|SRC|RDY|ROL|IMP-[A-Z]+|RBK|OPS-JOB|DSH|ALT|REC)-[A-Z0-9-]+)`\s*\|'
$ownedIds = @([regex]::Matches($packageText, $ownedPattern) | ForEach-Object { $_.Groups['id'].Value })
$globalDuplicates = @($ownedIds | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
if ($globalDuplicates.Count -gt 0) {
    Add-CheckError "Package-owned definition IDs are duplicated: $($globalDuplicates -join ', ')"
}

$ownedUnique = @($ownedIds | Sort-Object -Unique)
$exactTokenPattern = '`(?<id>(?:D23-RQ|PRM|CUT-EMP|WIN|DEC|OWN|HML|SRC|RDY|ROL|IMP-[A-Z]+|RBK|OPS-JOB|DSH|ALT|REC)-[A-Z0-9-]+)`'
$ownedReferences = @([regex]::Matches($packageText, $exactTokenPattern) | ForEach-Object { $_.Groups['id'].Value } | Sort-Object -Unique)
$unresolvedOwned = @($ownedReferences | Where-Object { $_ -notin $ownedUnique })
if ($unresolvedOwned.Count -gt 0) {
    Add-CheckError "Package has unresolved exact internal IDs: $($unresolvedOwned -join ', ')"
}

$externalReferenceRules = @(
    [pscustomobject]@{ Pattern = '(?:B03-MST|P09)-\d{2}[A-Z]?'; Authority = 'Doc17' },
    [pscustomobject]@{ Pattern = 'BK-\d{3}'; Authority = 'Doc21' },
    [pscustomobject]@{ Pattern = '(?:DOD|MAR)-\d{2}'; Authority = 'Doc21' },
    [pscustomobject]@{ Pattern = 'ETP-\d{2}'; Authority = 'Doc21' },
    [pscustomobject]@{ Pattern = '(?:EPC|RSK)-\d{2}'; Authority = 'Doc21' },
    [pscustomobject]@{ Pattern = 'GAT-\d{2}'; Authority = 'Doc22' },
    [pscustomobject]@{ Pattern = 'QLT-\d{3}'; Authority = 'Doc22' },
    [pscustomobject]@{ Pattern = '(?:QAT-(?:SEC|PERF|RES|REC|A11Y|DOC)|TST-API)-\d{3}'; Authority = 'Doc22C' },
    [pscustomobject]@{ Pattern = '(?:RST-GER|ENT-(?:IMP|CPT))-\d{2}'; Authority = 'Doc18' },
    [pscustomobject]@{ Pattern = '(?:API-REC|CTL-(?:IMP|REC))-\d{3}'; Authority = 'Doc20' }
)
foreach ($rule in $externalReferenceRules) {
    $referencePattern = '(?<![A-Z0-9-])(?<id>' + $rule.Pattern + ')(?![A-Z0-9-])'
    $externalIds = @([regex]::Matches($packageText, $referencePattern) |
        ForEach-Object { $_.Groups['id'].Value } | Sort-Object -Unique)
    foreach ($externalId in $externalIds) {
        $definitionPattern = '(?m)^\|\s*`?' + [regex]::Escape($externalId) + '`?(?:\s*\u2014|\s*\|)'
        if (-not [regex]::IsMatch($text[$rule.Authority], $definitionPattern)) {
            Add-CheckError "Package external reference is not defined in $($rule.Authority): $externalId"
        }
    }
}

$futureImprovementIds = @([regex]::Matches($packageText, '(?<![A-Z0-9-])(?<id>MF-\d{2})(?![A-Z0-9-])') |
    ForEach-Object { $_.Groups['id'].Value } | Sort-Object -Unique)
foreach ($futureImprovementId in $futureImprovementIds) {
    $headingPattern = '(?m)^#{1,6}\s+' + [regex]::Escape($futureImprovementId) + '(?:\s+\u2014|\s*$)'
    if (-not [regex]::IsMatch($text.Master, $headingPattern)) {
        Add-CheckError "Package future improvement reference is not defined in Master: $futureImprovementId"
    }
}

$rqLines = @($text.Doc23 -split "`r?`n" | Where-Object { $_ -match '^\|\s*`D23-RQ-' })
foreach ($line in $rqLines) {
    if ($line -notmatch '`(?:IMP-|REC-|RBK-|RDY-|OPS-JOB-|ALT-|DSH-|PRM-|CUT-EMP-|WIN-|DEC-|OWN-|HML-)') {
        Add-CheckError "D23 root lacks an exact executable package ID: $line"
    }
}

foreach ($i in 360..379) {
    $id = 'BK-' + $i
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 EPC-18 bridge is missing $id" }
    if ($text.Doc21 -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc21 definition is missing $id" }
}
foreach ($i in 1..10) {
    $id = 'GAT-' + $i.ToString('00')
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if (-not $text.Doc22.Contains($id)) { Add-CheckError "Doc22 is missing $id" }
}
foreach ($i in 1..8) {
    $id = 'QAT-REC-' + $i.ToString('000')
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if ($text.Doc22C -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc22C definition is missing $id" }
}
foreach ($i in 1..16) {
    $id = 'QAT-RES-' + $i.ToString('000')
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if ($text.Doc22C -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc22C definition is missing $id" }
}
foreach ($id in @('QAT-SEC-006','QAT-SEC-007','QAT-SEC-031','QAT-SEC-032','QAT-SEC-033','QAT-SEC-037')) {
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if ($text.Doc22C -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc22C definition is missing $id" }
}
foreach ($i in 1..7) {
    $id = 'QAT-PERF-' + $i.ToString('000')
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if ($text.Doc22C -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc22C definition is missing $id" }
}
foreach ($i in 1..8) {
    $id = 'QAT-A11Y-' + $i.ToString('000')
    if (-not $text.Doc23.Contains("``$id``")) { Add-CheckError "Doc23 bridge is missing $id" }
    if ($text.Doc22C -notmatch ('(?m)^\|\s*' + [regex]::Escape($id) + '\s*\|')) { Add-CheckError "Doc22C definition is missing $id" }
}

foreach ($name in @('Doc23','Doc23A','Doc23B','Doc23C','Doc23D')) {
    Assert-MarkdownTables $name $text[$name]
}

$normalizedPackage = Convert-ToAsciiLower $packageText
foreach ($forbidden in @(
    'dados reais em homologacao sao permitidos',
    'rollback destrutivo automatico',
    'GO condicionado e permitido',
    'K07 emite recibo',
    'e permitido manter dois controles autoritativos'
)) {
    if ($normalizedPackage.Contains($forbidden.ToLowerInvariant())) {
        Add-CheckError "Package contains forbidden scope statement: $forbidden"
    }
}

$normalizedAuthorityDocs = Convert-ToAsciiLower (($text.Doc17, $text.Doc18, $text.Doc19, $text.Doc20, $text.Doc20A, $text.Doc21, $text.Doc22, $text.Doc22C, $packageText) -join "`n")
foreach ($forbidden in @(
    'qualquer delta fecha a tentativa',
    'qualquer delta novo fecha a tentativa',
    'hash/versao final do ledger',
    'versao/hash final do ledger',
    'hash final do ledger',
    'primeiro numero interno projetado'
)) {
    if ($normalizedAuthorityDocs.Contains($forbidden)) {
        Add-CheckError "Authority documents contain obsolete wording: $forbidden"
    }
}

$documentValid = $errors.Count -eq 0
$planningReady = $documentValid -and $approved

$result = [ordered]@{
    DocumentValid = $documentValid
    ApprovalStatus = $(if ($approved) { 'APPROVED' } else { 'PENDING_USER' })
    D23PlanningReady = $planningReady
    Document23Requirements = @($rq | Sort-Object -Unique).Count
    Parameters = @($prm | Sort-Object -Unique).Count
    CompaniesToCut = @($cutEmp | Sort-Object -Unique).Count
    CutoverDecisions = @($dec | Sort-Object -Unique).Count
    NamedRoleSlots = @($own | Sort-Object -Unique).Count
    HomologationSlots = @($hml | Sort-Object -Unique).Count
    SourceClasses = @($src | Sort-Object -Unique).Count
    ReadinessGates = @($rdy | Sort-Object -Unique).Count
    DryRunSteps = @($dry | Sort-Object -Unique).Count
    RealLoadSteps = @($dat | Sort-Object -Unique).Count
    PreCutoverSteps = @($pre | Sort-Object -Unique).Count
    CutoverSteps = @($cut | Sort-Object -Unique).Count
    GoNoGoChecks = @($gng | Sort-Object -Unique).Count
    SmokeChecks = @($smk | Sort-Object -Unique).Count
    ReturnProcedures = @($ret | Sort-Object -Unique).Count
    HypercareChecks = @($hyp | Sort-Object -Unique).Count
    Runbooks = @($rbk | Sort-Object -Unique).Count
    OperationalJobs = @($opsJob | Sort-Object -Unique).Count
    Dashboards = @($dsh | Sort-Object -Unique).Count
    Alerts = @($alt | Sort-Object -Unique).Count
    RestoreSteps = @($rec | Sort-Object -Unique).Count
    ExecutionStatus = 'NOT_RUN_PLANNED'
    CutoverReady = $false
    ProductionGo = $false
    CodeStartedAtPlanningApproval = $false
    Etp00ImplementationCheckpoint = 'IN_PROGRESS_CONTROLLED'
    ProductionDeploymentStarted = $false
    Errors = @($errors)
}

$result | ConvertTo-Json -Depth 8
if ($errors.Count -gt 0) { exit 1 }
