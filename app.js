document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    document.getElementById("upload_submit").disabled = true
    event.preventDefault();
    await allFilesTranslator();
    document.getElementById("upload_submit").disabled = false
  });

const allFilesTranslator = async () => {
  document.getElementById("all_file").max = document.getElementById("phpFile").files.length
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

    const DownloadBox = document.getElementById("download_elements");
    const linkElement = document.createElement("a");
    linkElement.innerText = `${file.name}`;
    DownloadBox.appendChild(linkElement);
    linkElement.href = URL.createObjectURL(
      new Blob([str], { type: "text/php" })
    );
    linkElement.download = `${file.name}`;
    linkElement.click();

    const oldVal = document.getElementById("all_file").getAttribute("value");
    document.getElementById("all_file").value = parseInt(oldVal) + 1
  }
};

const oneOfAllFiles = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      let phpCode = event.target.result;
      const pattern = /\/\*[\s\S]*?\*\//g; // Regex pattern to match the /* some description */ pattern

      console.log(phpCode);
      phpCode = phpCode.replace(pattern, "");
      console.log(phpCode);
      phpCode = phpCode.split("[")[1];
      phpCode = phpCode.split("]")[0];
      phpCode = phpCode.split(",");

      phpCode = phpCode.filter((str) => str.trim() !== "");
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
  for (let item of strArr) {
    // https://one-api.ir/translate/?token=576329:651ea8266c711&action=google&lang=fa&q=admin%20tags_delete
    const str = item.replaceAll("_", " ")
    let res = await fetch(
      `https://one-api.ir/translate/?token=576329:651ea8266c711&action=google&lang=fa&q=${str}`
    );
    res = await res.json();
    newArr.push(`'${item.trim()}' => '${res.result}'`);
    const oldVal = document.getElementById("one_file").getAttribute("value");
    document.getElementById("one_file").value = parseInt(oldVal) + 1
  }
  return newArr;
}
