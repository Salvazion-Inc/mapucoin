/**
 * Official park photos from pasesparques.cl (CloudFront).
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/images/places");
const CDN = "https://d6myp1633h7qr.cloudfront.net";
const UA = "Mapucoin/1.0 (https://mapucoin.com; catalog photos from pasesparques.cl)";

const product = (id) => `${CDN}/products/${id}_desktop.webp`;

const photos = [
  ["pn-vicente-perez-rosales", product("1360fb62-dd61-45be-9149-d7b3cb3481a7")],
  ["pn-conguillio", product("bb364e3b-d684-467c-bf44-a4b1ae688432")],
  ["pn-laguna-del-laja", product("b73b6c6a-574a-4ba6-9815-ad319afa1bf5")],
  ["rn-los-flamencos", product("739104f1-0302-43a2-adac-04aba6f0e7c4")],
  ["pn-villarrica", product("27e52136-4fe0-4e3c-b768-d2a84c59d106")],
  ["pn-alerce-andino", product("86a2d04c-18d1-4f49-b0c5-16070f74c18b")],
  ["pn-huerquehue", product("0b83660f-dc52-4a2b-9d8a-debc9af88306")],
  ["pn-chiloe", product("388f08de-76b2-4997-bc0c-75539514305a")],
  ["mn-cerro-nielol", product("54e3b49b-c285-41ef-9dc6-7feb45686b0c")],
  ["pn-nonguen", product("6d519642-53b8-4ac3-963a-789d22d59ad3")],
  ["mn-lahuen-nadi", product("a9362b3a-7bdb-457e-ba65-89ccb181ac82")],
  ["pn-tolhuaca", product("7052738d-3e47-4d12-9c24-afb71fb18e51")],
  ["mn-cueva-del-milodon", product("523fce6c-9cc9-459e-a3ce-90f6c1e148fa")],
  ["pn-queulat", product("b38a5774-a48b-4f8e-8776-db52b05f794e")],
  ["pn-rio-clarillo", product("e5e92410-2086-4af9-a9e8-ba87ef0969d5")],
  ["pn-bosque-fray-jorge", product("f42ad807-0c45-4ef0-8f11-28391c70eff0")],
  ["pn-bernardo-ohiggins", product("13dfaf64-81c6-460d-a655-82c9be72ffa6")],
  ["rn-magallanes", product("3ac2806b-494a-40b1-af02-8e2e28778848")],
  ["rn-altos-de-lircay", product("e4dcf6e1-f400-40ae-8dc0-1f48177850ce")],
  ["rn-rio-de-los-cipreses", product("55d82547-df87-4a4c-801d-7c72b92c7aa6")],
  ["rn-rio-simpson", product("99eef5f8-f8af-46cc-be8b-3be69176f53d")],
  ["rn-coyhaique", product("cd19b035-606e-4738-b68c-e1dbeab2a2ab")],
  ["pn-villarrica-sur", product("31615a0f-824a-4345-9801-c304d975ef83")],
  ["rn-federico-albert", product("0822fdde-1336-4032-9ed0-bb14fcffff49")],
  ["pn-laguna-san-rafael", product("1ace76d0-6436-4265-93d8-74fcfd5cb985")],
  ["pn-llanos-de-challe", product("91fe8976-1563-4260-9510-c523a3415f9a")],
  ["mn-el-morado", product("bbf804e6-ad97-4aeb-8857-7b721f67a9a6")],
  ["rn-nuble", product("e5f4db91-a5e9-4dbf-a649-1e12740f5e78")],
  ["rn-laguna-parrillar", product("330573b5-ac34-4207-bccf-fef610d1c255")],
  ["rn-pampa-del-tamarugal", product("90d6ddc8-0339-47d2-ba0e-202eba41c8bf")],
  ["mn-pichasca", product("4ec83a04-8014-4874-971e-4a34048e77da")],
  ["rn-los-ruiles", product("c714710a-415d-4813-b44a-e0748adb3368")],
  ["rn-mocho-choshuenco", product("831a22b2-33e0-4338-893d-5d60a547fdc7")],
  ["rn-laguna-torca", product("d4d71f48-a89a-4d38-be6a-b27a17f80f02")],
  ["pn-pali-aike", product("abf44f4f-2f0d-4f0f-9b63-09399cd5830f")],
  ["mn-dos-lagunas", product("1c71b187-8f35-4033-8525-06189af84ddf")],
  ["pn-pan-de-azucar", product("a14606a0-0b65-46ff-b0d6-600af01e928c")],
  ["rn-las-chinchillas", product("01bcae93-395e-4e1d-8ab4-67a0040a1047")],
  ["rn-huemules-de-niblinto", product("7d7d34b6-77cc-45d2-aea9-8a8925b0526d")],
  ["pn-nevado-tres-cruces", product("e017a1a1-8964-45b8-b066-0edf81b72934")],
  ["rn-el-yali", product("8841679d-1dee-4427-8d45-5deb68dc3a17")],
  ["rn-lago-penuelas", `${CDN}/businesses/landings/peneulas.webp`],
  ["pn-patagonia", `${CDN}/businesses/landings/patagonia.webp`],
  ["pn-alerce-costero", `${CDN}/businesses/landings/la-romaza-3.jpg`],
  ["paine", product("706fe249-1e70-4e3b-ad4d-81ac41318b76")],
  ["siete-tazas", `${CDN}/businesses/landings/radal-siete-tazas.webp`],
  ["olmue", `${CDN}/businesses/landings/la-campana.webp`],
  ["juan-fernandez", product("907900a1-9376-48fb-beec-dd2d5ca70766")],
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const failed = [];
  for (const [slug, url] of photos) {
    const dest = path.join(OUT, `${slug}.jpg`);
    try {
      console.log("get", slug);
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "image/*" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf)
        .rotate()
        .resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 84, mozjpeg: true })
        .toFile(dest);
      const s = await stat(dest);
      console.log("ok", slug, Math.round(s.size / 1024) + "kb");
    } catch (err) {
      failed.push(slug);
      console.log("FAIL", slug, err.message);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  if (failed.length) {
    console.log("Failed:", failed.join(", "));
    process.exitCode = 1;
  }
}

main();
