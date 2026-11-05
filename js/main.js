const menuToggle = document.querySelector("#menuToggle");
const nav = document.querySelector("#mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    nav.querySelectorAll("a").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const countries = ["Япония", "Франция", "Греция", "Объединённые Арабские Эмираты", "Таиланд", "Италия", "Исландия", "Южная Корея"];
document.querySelector("#surpriseBtn").addEventListener("click", () => {
  const pick = countries[Math.floor(Math.random() * countries.length)];
  document.querySelector("#destinationResult").textContent = `Идея для следующего путешествия: ${pick} ✨`;
});
document.querySelector("#year").textContent = new Date().getFullYear();

/* Галерея: добавление фотографий без редактирования HTML/JS.
   Изображения хранятся в IndexedDB браузера на этом устройстве. */
const DB_NAME = "AyanaTravelPortfolio";
const STORE_NAME = "photos";
const gallery = document.querySelector("#galleryGrid");
const photoInput = document.querySelector("#photoInput");
const hint = document.querySelector("#galleryHint");

function openPhotoDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getPhotos() {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function savePhoto(file) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).add({
      name: file.name, type: file.type, blob: file, addedAt: Date.now()
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function deletePhoto(id) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
}
async function renderSavedPhotos() {
  try {
    const photos = await getPhotos();
    gallery.querySelectorAll(".user-photo").forEach(item => item.remove());
    photos.forEach(photo => {
      const card = document.createElement("div");
      card.className = "user-photo";
      const image = document.createElement("img");
      image.src = URL.createObjectURL(photo.blob);
      image.alt = photo.name || "Фотография из путешествия";
      const remove = document.createElement("button");
      remove.className = "remove-photo";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Удалить фотографию");
      remove.addEventListener("click", async () => {
        await deletePhoto(photo.id);
        renderSavedPhotos();
      });
      card.append(image, remove);
      gallery.append(card);
    });
    hint.textContent = `Добавлено вами фотографий: ${photos.length}. Они сохранены в этом браузере на этом устройстве.`;
  } catch (error) {
    hint.textContent = "Не удалось открыть хранилище фотографий. Попробуйте запустить сайт через Live Server.";
  }
}
photoInput.addEventListener("change", async event => {
  const files = [...event.target.files].filter(file => file.type.startsWith("image/"));
  if (!files.length) return;
  try {
    for (const file of files) await savePhoto(file);
    await renderSavedPhotos();
  } catch (error) {
    hint.textContent = "Не удалось сохранить фото. Возможно, в браузере закончилось место.";
  }
  photoInput.value = "";
});
renderSavedPhotos();
