import "./styles.css";

const deploySteps = [
  {
    title: "Build",
    text: "O Vite gera HTML, CSS e JavaScript otimizados dentro da pasta dist.",
  },
  {
    title: "Bucket",
    text: "O S3 armazena os arquivos estaticos que serao servidos como site.",
  },
  {
    title: "Permissoes",
    text: "Para estudo, o bucket pode ser publico. Em producao, prefira CloudFront.",
  },
  {
    title: "Sync",
    text: "O AWS CLI envia somente as mudancas e remove arquivos antigos com --delete.",
  },
];

const checklist = [
  "Configurar AWS CLI",
  "Criar bucket S3",
  "Gerar npm run build",
  "Publicar a pasta dist",
  "Testar a URL do website",
];

document.querySelector("#app").innerHTML = `
  <main class="pageShell">
    <section class="hero">
      <div class="heroCopy">
        <p class="eyebrow">Vite + Amazon S3</p>
        <h1>Site estatico pronto para</h1>
        <h1>Teste Deploy S3</h1>
        <p class="lead">
          Um projeto pequeno para praticar o ciclo completo: desenvolver,
          gerar build, enviar para o S3 e entender cache de arquivos estaticos.
        </p>
      </div>

      <img
        class="flowImage"
        src="./aws-s3-flow.svg"
        alt="Fluxo visual de deploy do Vite para Amazon S3"
      />
    </section>

    <section class="statusBar" aria-label="Resumo do projeto">
      <div>
        <strong>Vite</strong>
        <span>build rapido</span>
      </div>
      <div>
        <strong>dist</strong>
        <span>saida estatica</span>
      </div>
      <div>
        <strong>S3</strong>
        <span>hosting simples</span>
      </div>
    </section>

    <section class="contentGrid">
      <div class="stepGrid" aria-label="Etapas de deploy">
        ${deploySteps
          .map(
            (step, index) => `
              <article class="stepCard">
                <span class="stepNumber">${String(index + 1).padStart(2, "0")}</span>
                <h2>${step.title}</h2>
                <p>${step.text}</p>
              </article>
            `,
          )
          .join("")}
      </div>

      <aside class="checkPanel" aria-label="Checklist de estudo">
        <h2>Checklist</h2>
        <ul>
          ${checklist.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </aside>
    </section>
  </main>
`;
