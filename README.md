# Estudos S3 com Vite

Projeto Vite estatico para praticar deploy de frontend na AWS usando S3 privado, CloudFront e GitHub Actions.

## Arquitetura

```text
GitHub Actions
  -> npm run build
  -> upload da pasta dist para o S3
  -> invalidacao do cache no CloudFront

Usuario
  -> CloudFront
  -> S3 privado
```

## Rodar localmente

```powershell
npm install
npm run dev
```

## Gerar build

```powershell
npm run build
```

O resultado fica em `dist`.

## Deploy manual

Veja o passo a passo em `docs/deploy-s3.md`.

Depois de configurar o AWS CLI e criar o bucket:

```powershell
npm run build
npm run deploy:s3 -- -Bucket nome-do-seu-bucket
```

## Deploy automatico com GitHub Actions

O workflow fica em `.github/workflows/deploy-s3-cloudfront.yml`.

Ele roda quando houver push na branch `main` ou quando for iniciado manualmente pela aba Actions do GitHub.

### Variaveis do repositorio

No GitHub, configure em `Settings > Secrets and variables > Actions > Variables`:

| Nome | Exemplo | Descricao |
| --- | --- | --- |
| `AWS_REGION` | `sa-east-1` | Regiao onde o bucket S3 foi criado |
| `S3_BUCKET` | `meu-estudo-aws-frontend` | Nome do bucket S3 |
| `CLOUDFRONT_DISTRIBUTION_ID` | `ECSHDLOLQ7BWX` | ID da distribuicao CloudFront |

### Secret do repositorio

Configure em `Settings > Secrets and variables > Actions > Secrets`:

| Nome | Exemplo | Descricao |
| --- | --- | --- |
| `AWS_ROLE_TO_ASSUME` | `arn:aws:iam::123456789012:role/github-actions-deploy-s3-cloudfront` | Role IAM assumida pelo GitHub via OIDC |

### Configuracao OIDC na AWS

No IAM da AWS, crie um provedor de identidade OIDC para o GitHub:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

Depois crie uma role IAM para o GitHub Actions assumir. A trust policy deve limitar o acesso ao seu repositorio e a branch `main`.

Troque `ACCOUNT_ID`, `OWNER` e `REPO` pelos seus valores reais:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:OWNER/REPO:ref:refs/heads/main",
            "repo:OWNER@*/REPO@*:ref:refs/heads/main"
          ]
        }
      }
    }
  ]
}
```

O segundo formato cobre repositorios GitHub que usam claims OIDC imutaveis com IDs no `sub`.

### Permissoes minimas da role IAM

Troque `nome-do-seu-bucket`, `ACCOUNT_ID` e `DISTRIBUTION_ID` pelos valores reais:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::nome-do-seu-bucket"
    },
    {
      "Sid": "WriteBucketObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*"
    },
    {
      "Sid": "InvalidateCloudFront",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

### Fluxo esperado

1. Fazer uma alteracao no projeto.
2. Fazer commit e push para `main`.
3. Abrir a aba `Actions` no GitHub.
4. Acompanhar o workflow `Deploy S3 + CloudFront`.
5. Acessar a URL do CloudFront depois que a invalidacao terminar.

## Observacoes importantes

- O bucket continua privado; quem entrega o site publicamente e o CloudFront.
- O upload envia o conteudo de `dist`, nao a pasta `dist` em si.
- Arquivos com hash em `assets` recebem cache longo.
- `index.html` recebe `no-cache` para evitar HTML antigo apontando para assets antigos.
- Para usar rotas de SPA, configure no CloudFront uma resposta customizada de `403` ou `404` para `/index.html`.
