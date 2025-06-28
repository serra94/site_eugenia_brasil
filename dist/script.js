var timelineSwiper = new Swiper ('.timeline .swiper-container', {
  direction: 'vertical',
  loop: false,
  speed: 1600,
  pagination: '.swiper-pagination',
  paginationBulletRender: function (swiper, index, className) {
    var year = document.querySelectorAll('.swiper-slide')[index].getAttribute('data-year');
    return '<span class="' + className + '">' + year + '</span>';
  },
  paginationClickable: true,
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
  breakpoints: {
    768: {
      direction: 'horizontal',
    }
  }
});



function abrirModal(periodo) {
  fetchConteudos(periodo);
  document.getElementById("modal").style.display = "block";
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-conteudo").innerHTML = "";
}

async function fetchConteudos(periodo) {
  try {
    const resposta = await fetch(`dados_json/${periodo}.json`);
    if (!resposta.ok) {
      throw new Error("Erro ao buscar JSON.");
    }

    const dados = await resposta.json();
    const topicos = ["contexto_politico", "contexto_normativo", "protagonistas", "modos_de_apresentacao"];
    const nomesTopicos = {
      contexto_politico: "Contexto Político",
      contexto_normativo: "Contexto Normativo",
      protagonistas: "Protagonistas",
      modos_de_apresentacao: "Modos de Apresentação"
    };

    let html = "";

    for (const topico of topicos) {
      const conteudo = dados[topico];
      let sectionHTML = `<section><h3>${nomesTopicos[topico]}</h3>`;

      if (conteudo.texto) {
        sectionHTML += `<div class="markdown-text">${marked.parse(conteudo.texto)}</div>`;
      }

      if (conteudo.links) {
        sectionHTML += `<div class="markdown-text">${marked.parse("**Links:**\n\n" + conteudo.links)}</div>`;
      }

      if (conteudo.galeria?.length) {
        sectionHTML += `<div class="galeria">` +
          conteudo.galeria.map(img => `
            <figure class="galeria-item">
              <img src="dados/${periodo}/${topico}/galeria/${img.arquivo}" class="thumb" loading="lazy" data-legenda="${img.legenda.replace(/"/g, '&quot;')}">
            </figure>
          `).join("") +
          `</div>`;
      }

      sectionHTML += "</section>";
      html += sectionHTML;
    }

    // Referências
    try {
      const refResp = await fetch(`dados/${periodo}/referencias/referencias.md`);
      if (refResp.ok) {
        const refs = (await refResp.text()).trim();
        if (refs) {
          html += `
            <section>
              <h3>Referências</h3>
              <div class="markdown-text">${marked.parse(refs)}</div>
            </section>
          `;
        }
      }
    } catch (err) {
      html += `<section><h3>Referências</h3><p><em>Erro ao carregar referências.</em></p></section>`;
    }

    const ano = periodo.split("_")[1].replace("-", "–");
    document.getElementById("modal-titulo").innerText = `Período: ${ano}`;
    document.getElementById("modal-conteudo").innerHTML = html;

  } catch (erro) {
    console.error("Erro ao carregar JSON:", erro);
    document.getElementById("modal-conteudo").innerHTML = `<p><em>Erro ao carregar os dados.</em></p>`;
  }
}



async function listarImagens(pathBase) {
  try {
    const galeriaResp = await fetch(`${pathBase}/galeria/`);
    if (!galeriaResp.ok) return [];

    const html = await galeriaResp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const links = Array.from(doc.querySelectorAll("a"))
      .map(a => a.getAttribute("href"))
      .filter(href => /\.(jpg|jpeg|png|webp)$/i.test(href));

    // Carregar legendas
    const legendasResp = await fetch(`${pathBase}/galeria/legendas.txt`);
    let legendaMap = {};

    if (legendasResp.ok) {
      const linhas = (await legendasResp.text()).trim().split("\n");
      for (const linha of linhas) {
        const [arquivo, legenda] = linha.split("|");
        if (arquivo && legenda) {
          legendaMap[arquivo.trim()] = legenda.trim();
        }
      }
    }

    return links.map(file => ({
      src: `${pathBase}/galeria/${file}`,
      legenda: legendaMap[file] || ""
    }));

  } catch (err) {
    return [];
  }
}


document.addEventListener("click", function(e) {
  if (e.target.classList.contains("thumb")) {
    abrirImagem(e.target.src);
  }
});

function abrirImagem(src) {
  const modal = document.getElementById("image-modal");
  const img = document.getElementById("image-modal-content");
  const caption = document.getElementById("image-modal-caption");

  img.src = src;

  // Achar o elemento <img> original com src igual ao clicado
  const thumb = Array.from(document.querySelectorAll(".thumb")).find(el => el.src === src);
  caption.innerText = thumb?.dataset.legenda || "";

  modal.style.display = "block";
}

function fecharImagem() {
  document.getElementById("image-modal").style.display = "none";
}