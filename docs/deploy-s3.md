# Deploy no Amazon S3

Este projeto gera arquivos estaticos na pasta `dist`, prontos para publicar em um bucket S3.

O modelo recomendado neste estudo e:

```text
CloudFront publico
  -> bucket S3 privado
```

## 1. Configurar AWS CLI

```powershell
aws configure
```

Informe access key, secret key, regiao e formato de saida.

## 2. Criar o bucket

```powershell
aws s3 mb s3://nome-do-seu-bucket --region us-east-1
```

Troque `nome-do-seu-bucket` e a regiao conforme seu estudo.

## 3. Manter o bucket privado

Mantenha o bloqueio de acesso publico ativado. A policy do bucket deve permitir leitura apenas para a distribuicao CloudFront.

```json
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

Normalmente o proprio CloudFront gera essa policy quando voce configura Origin Access Control.

## 4. Configurar o CloudFront

Na distribuicao CloudFront:

- Origin: bucket S3.
- Origin access: Origin Access Control.
- Viewer protocol policy: Redirect HTTP to HTTPS.
- Default root object: `index.html`.
- WAF: desativado para este laboratorio.

## 5. Gerar build e enviar manualmente

```powershell
npm run build
npm run deploy:s3 -- -Bucket nome-do-seu-bucket
```

O script envia `index.html` sem cache longo e os assets com cache longo. Isso combina bem com o Vite, porque os arquivos dentro de `assets` recebem hash no nome.

## 6. Invalidar cache do CloudFront

Depois de um deploy manual, invalide o cache:

```powershell
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## 7. Acessar a URL

Use o dominio da distribuicao CloudFront:

```text
https://dxxxxxxxxxxxxx.cloudfront.net
```

## 8. Deploy automatico

O deploy automatico esta configurado em `.github/workflows/deploy-s3-cloudfront.yml`.

Ele faz build, sincroniza `dist` com o S3 e cria uma invalidacao no CloudFront a cada push na branch `main`.
