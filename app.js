document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    await allFilesTranslator();
  });

const allFilesTranslator = async () => {
  document
    .getElementById("all_file")
    .setAttribute("max", document.getElementById("phpFile").files.length);
  for (const file of document.getElementById("phpFile").files) {
    const res = await oneOfAllFiles(file);
    console.log(res);
    const str = `
    <?php
    return [
        ${res.join(", \n")}
    ];
    `;
    console.log(str);

    const DownloadBox = document.getElementById("download_elements")
    const linkElement = document.createElement("a");
    linkElement.innerText = `${file.name}`;
    DownloadBox.appendChild(linkElement);
    linkElement.href = URL.createObjectURL(new Blob([str], { type: 'text/php' }));
    linkElement.download = `${file.name}`;
    linkElement.click();

    const oldVal = document.getElementById("all_file").getAttribute("value");
    document
      .getElementById("all_file")
      .setAttribute("value", parseInt(oldVal) + 1);
  }
};

const oneOfAllFiles = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      let phpCode = event.target.result;
      phpCode = phpCode.split("[")[1];
      phpCode = phpCode.split("]")[0];
      phpCode = phpCode.split(",");

      phpCode = phpCode.filter((str) => str.trim() != "");
      phpCode = phpCode.map((str) => {
        str = str.replace(/[\/\n,"']/g, "").trim();
        str = str.split("=>")[0];
        return str;
      });
      const result = await oneFileTranslator(phpCode);
      resolve(result);
    };
    reader.readAsText(file);
  });
};

async function oneFileTranslator(strArr) {
  document.getElementById("one_file").setAttribute("max", strArr.length);
  const newArr = [];
  for (item of strArr) {
    let res = await fetch(
      `https://one-api.ir/translate/?token=576329:651ea8266c711&action=google&lang=fa&q=${item}`
    );
    res = await res.json();
    newArr.push(`'${item}' => '${res.result}'`);
    const oldVal = document.getElementById("one_file").getAttribute("value");
    document
      .getElementById("one_file")
      .setAttribute("value", parseInt(oldVal) + 1);
  }
  return newArr; // I want the next request, to be send after received this reponse
}
