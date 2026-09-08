import type { CatalogItem } from "./catalog";
import type { Locale } from "./locale";

type ItemText = {
  name?: string;
  tagline?: string;
  description?: string;
};

const en: Record<string, ItemText> = {
  "curanto-chilote": {
    description:
      "Chilote ritual: pit, hot stones, chapaleles and shellfish from the channel. With a local family.",
  },
  "asado-patagonico": {
    description:
      "Ranch lamb, merken chimichurri and Maule wine. Dinner in the austral dusk.",
  },
  "cocina-mapuche": {
    description:
      "Lunch in a ruka with local producers. Territory story, volcano herbs and candeal wheat bread.",
  },
  "mariscal-valpo": {
    description:
      "Caleta with a view of the hills. Machas a la parmesana, reineta ceviche and Casablanca wine.",
  },
  "pisco-elqui": {
    description:
      "Three stops: family distillery, high vineyard and pisco sour with Pica lime.",
  },
  "mercado-central": {
    description:
      "A walk through fish stalls, pastel de choclo and a close in Lastarria with carmenère.",
  },
  "mote-con-huesillos": {
    description:
      "The glass of a Santiago summer: soaked dried peaches, wheat mote and chancaca syrup. Fair, plaza or linden shade.",
  },
  "pastelitos-curacavi": {
    description:
      "The classic stop on the road to Curacaví: crisp pastry, manjar filling and a dust of sugar. Pot coffee on the side.",
  },
  sopaipillas: {
    description:
      "A squash disc in hot oil. In winter they go pasadas, in summer with pebre. The Chilean street in one bite.",
  },
  "empanadas-de-pino": {
    description:
      "The empanada of national holidays and Sundays. Oven dough, juicy pino and the ritual of not biting the surprise olive.",
  },
  "pastel-de-choclo": {
    description:
      "Clay cazuela, sweet corn paste and pino underneath. The fundo lunch of the Central Valley, with Chilean salad.",
  },
  humitas: {
    description:
      "Summer season: grated corn, basil and a straw tie. Eaten with tomato salad and ají.",
  },
  "caldillo-de-congrio": {
    description:
      "Golden congrio soup, potato, tomato and a sea stock. Caleta, oilcloth and a Casablanca white.",
  },
  "pastel-de-centolla": {
    description:
      "King crab meat, cream and a gratin. Eaten on a ranch or caleta, with an extreme white and wind at the window.",
  },
  mariscal: {
    description:
      "Mussels, clams, piure, shrimp and ice that does not forgive. The caleta aperitif before the hot plate.",
  },
  cazuela: {
    description:
      "The lunch of a Chilean home. Each spoonful brings a different piece. Served steaming, with cilantro and colored ají.",
  },
  charquican: {
    description:
      "A thick stew of vegetables and dried meat. A winter and country plate, with ají and cilantro.",
  },
  "porotos-granados": {
    description:
      "The stew of February. Ripe beans, corn mash and colored oil. Eaten with Chilean salad.",
  },
  chorrillana: {
    description:
      "The platter of Valparaíso. Shared with pipeño or a beer, after walking up Cerro Alegre.",
  },
  "astronomia-atacama": {
    name: "Astronomy in the desert",
    tagline: "Telescopes, the Milky Way and an Andean telling of the sky.",
  },
  "sandboard-atacama": {
    name: "Sandboarding in Valle de la Muerte",
    tagline: "Gypsum dunes, a board and Licancabur in the background.",
  },
  "buceo-punta-choros": {
    name: "Diving at Punta de Choros",
    tagline: "Clear water, sea lions and the Humboldt Penguin Reserve.",
  },
  "surf-pichilemu": {
    name: "Surf at Punta de Lobos",
    tagline: "Pacific swell in the capital of Chilean surf.",
  },
  "cata-colchagua": {
    name: "Wine tasting in Colchagua",
    tagline: "Carmenère, cabernet and the valley in a glass.",
  },
  "volcan-villarrica": {
    name: "Trekking on Villarrica volcano",
    tagline: "Active crater, crampons and a view of the lakes.",
  },
  "ciclismo-pucon": {
    name: "Cycling around Villarrica",
    tagline: "Lakeside route, araucaria forest and the cone always in view.",
  },
  "termas-geometricas": {
    name: "Termas Geométricas",
    tagline: "Red walkways, volcanic pools and forest.",
  },
  "kayak-siete-tazas": {
    name: "Kayak at Siete Tazas",
    tagline: "Basalt pools, waterfalls and the Claro river by kayak.",
  },
  "rafting-futaleufu": {
    name: "Rafting on the Futaleufú",
    tagline: "Class IV–V whitewater on the most famous river of the south.",
  },
  "barco-peulla": {
    name: "Sailing to Peulla",
    tagline: "A lake crossing, volcanoes and the village at the end of Todos los Santos.",
  },
  "nautico-llanquihue": {
    name: "Water sports on Llanquihue",
    tagline: "Kayak, sail or paddle with Osorno reflected in the lake.",
  },
  "tour-bosque-chiloe": {
    name: "Tour of the forests of Chiloé",
    tagline: "Tepú, young alerce, palafitos and the mythology of the archipelago.",
  },
  "trekking-la-campana": {
    name: "Trekking in La Campana",
    tagline: "Chilean palm, sclerophyll forest and the hill Darwin climbed.",
  },
  "ski-valle-nevado": {
    name: "Ski at Valle Nevado",
    tagline: "Andean slopes an hour from Santiago.",
  },
  "snowboard-chillan": {
    name: "Snowboard in Chillán",
    tagline: "Volcanic snow, forest and the runs of Nevados de Chillán.",
  },
  "geiseres-el-tatio": {
    name: "El Tatio geysers",
    tagline: "Sunrise at 4,300 m, steam columns and the altiplano.",
  },
  "kayak-bahia-inglesa": {
    name: "Kayak in Bahía Inglesa",
    tagline: "Turquoise water, coastal desert and a white-sand cove.",
  },
  "cata-maipo": {
    name: "Wine tasting in the Maipo",
    tagline: "Carmenère and cabernet half an hour from the capital.",
  },
  "cata-elqui": {
    name: "Pisco and vineyards in Elqui",
    tagline: "Muscat, a family distillery and the valley in a glass.",
  },
  "kayak-laja": {
    name: "Kayak on the Laja",
    tagline: "Laja waters, forest and the classic waterfall of the south.",
  },
  "navegacion-marmol": {
    name: "Sailing to the Marble Chapels",
    tagline: "Blue caverns on General Carrera Lake.",
  },
  "sendero-alerce-chiloe": {
    name: "Alerce trail in Chiloé",
    tagline: "Alerce, tepú and the evergreen forest of the archipelago.",
  },
  "ski-la-parva": {
    name: "Ski at La Parva",
    tagline: "Family runs and off-piste a step from Farellones.",
  },
  "valle-de-la-luna": {
    name: "Sunset in Valle de la Luna",
    tagline: "Dunes, salt flat and the sun falling on Licancabur.",
  },
  "w-paine": {
    name: "A day at Base Torres",
    tagline: "The classic trek to the three granite towers.",
  },
  "cerros-valpo": {
    name: "Hills, murals and funiculars",
    tagline: "Alegre, Concepción and the port with a local guide.",
  },
  "tongariki-amanecer": {
    name: "Sunrise at Tongariki",
    tagline: "Fifteen moai against the Pacific sun.",
  },
};

const pt: Record<string, ItemText> = {
  "curanto-chilote": {
    description:
      "Ritual chilote: buraco, pedras quentes, chapaleles e mariscos do canal. Com uma família local.",
  },
  "asado-patagonico": {
    description:
      "Cordeiro de estância, chimichurri de merken e vinho do Maule. Jantar na luz do entardecer austral.",
  },
  "cocina-mapuche": {
    description:
      "Almoço em ruka com produtoras locais. Relato do território, ervas do vulcão e pão de trigo candeal.",
  },
  "mariscal-valpo": {
    description:
      "Caleta com vista aos cerros. Machas à parmesana, ceviche de reineta e vinho de Casablanca.",
  },
  "pisco-elqui": {
    description:
      "Três paradas: destilaria familiar, vinhedo de altura e pisco sour com limão de Pica.",
  },
  "mercado-central": {
    description:
      "Percurso entre peixarias, pastel de choclo e um fecho em Lastarria com carmenère.",
  },
  "mote-con-huesillos": {
    description:
      "O copo do verão santiaguino: pêssegos secos hidratados, mote e um xarope de chancaca. Feira, praça ou sombra de tília.",
  },
  "pastelitos-curacavi": {
    description:
      "O clássico da parada em Curacaví: massa crocante, recheio de manjar e um pó de açúcar. Café de panela ao lado.",
  },
  sopaipillas: {
    description:
      "Disco de abóbora em óleo quente. No inverno vão pasadas, no verão com pebre. A rua chilena num bocado.",
  },
  "empanadas-de-pino": {
    description:
      "A empanada das festas pátrias e do domingo. Massa de forno, pino suculento e o ritual de não morder a azeitona de surpresa.",
  },
  "pastel-de-choclo": {
    description:
      "Cazuela de barro, pasta de milho doce e pino por baixo. O almoço de fundo do Vale Central, com salada chilena.",
  },
  humitas: {
    description:
      "Temporada de verão: milho ralado, manjericão e um amarrio de palha. Comem-se com salada de tomate e ají.",
  },
  "caldillo-de-congrio": {
    description:
      "Sopa de congrio dourado, batata, tomate e um fundo de mar. Caleta, toalha de oleado e um branco de Casablanca.",
  },
  "pastel-de-centolla": {
    description:
      "Carne de centola, creme e um gratinado. Come-se em estância ou caleta, com um branco extremo e vento na janela.",
  },
  mariscal: {
    description:
      "Mexilhões, amêijoas, piure, camarão e um gelo que não perdoa. O aperitivo de caleta antes do prato quente.",
  },
  cazuela: {
    description:
      "O almoço de casa chilena. Cada colherada traz um pedaço distinto. Serve-se fumegante, com coentro e ají de cor.",
  },
  charquican: {
    description:
      "Guisado espesso de verdura e carne seca. Prato de inverno e de campo, com ají e coentro.",
  },
  "porotos-granados": {
    description:
      "O guisado de fevereiro. Feijão maduro, mazamorra de milho e um óleo de cor. Come-se com salada chilena.",
  },
  chorrillana: {
    description:
      "A travessa de Valparaíso. Partilha-se com copo de pipeño ou uma cerveja, depois de subir o Alegre a pé.",
  },
  "astronomia-atacama": {
    name: "Astronomia no deserto",
    tagline: "Telescópios, Via Láctea e um relato andino do céu.",
  },
  "sandboard-atacama": {
    name: "Sandboard no Valle de la Muerte",
    tagline: "Dunas de gesso, prancha e o Licancabur ao fundo.",
  },
  "buceo-punta-choros": {
    name: "Mergulho em Punta de Choros",
    tagline: "Água clara, leões-marinhos e a Reserva do Pinguim de Humboldt.",
  },
  "surf-pichilemu": {
    name: "Surf em Punta de Lobos",
    tagline: "O swell do Pacífico na capital do surf chileno.",
  },
  "cata-colchagua": {
    name: "Degustação de vinhos em Colchagua",
    tagline: "Carmenère, cabernet e o vale na taça.",
  },
  "volcan-villarrica": {
    name: "Trekking no vulcão Villarrica",
    tagline: "Cratera ativa, crampons e vista aos lagos.",
  },
  "ciclismo-pucon": {
    name: "Ciclismo ao redor do Villarrica",
    tagline: "Rota lacustre, bosque de araucária e o cone sempre à vista.",
  },
  "termas-geometricas": {
    tagline: "Passarelas vermelhas, poços de água vulcânica e bosque.",
  },
  "kayak-siete-tazas": {
    name: "Caiaque em Siete Tazas",
    tagline: "Poços de basalto, cascatas e o rio Claro de caiaque.",
  },
  "rafting-futaleufu": {
    name: "Rafting no Futaleufú",
    tagline: "Águas brancas classe IV–V no rio mais famoso do sul.",
  },
  "barco-peulla": {
    name: "Navegação até Peulla",
    tagline: "Travessia de lagos, vulcões e o povoado no fundo do Todos los Santos.",
  },
  "nautico-llanquihue": {
    name: "Esportes náuticos no Llanquihue",
    tagline: "Caiaque, veleiro ou paddle com o Osorno refletido no lago.",
  },
  "tour-bosque-chiloe": {
    name: "Tour pelos bosques de Chiloé",
    tagline: "Tepú, alerce jovem, palafitos e a mitologia do arquipélago.",
  },
  "trekking-la-campana": {
    name: "Trekking em La Campana",
    tagline: "Palma chilena, bosque esclerófilo e o cerro que Darwin subiu.",
  },
  "ski-valle-nevado": {
    name: "Ski em Valle Nevado",
    tagline: "Pistas andinas a uma hora de Santiago.",
  },
  "snowboard-chillan": {
    name: "Snowboard em Chillán",
    tagline: "Neve vulcânica, bosque e pistas do Nevados de Chillán.",
  },
  "geiseres-el-tatio": {
    name: "Gêiseres do Tatio",
    tagline: "Amanhecer a 4.300 m, colunas de vapor e altiplano.",
  },
  "kayak-bahia-inglesa": {
    name: "Caiaque em Bahía Inglesa",
    tagline: "Água turquesa, deserto costeiro e enseada de areia branca.",
  },
  "cata-maipo": {
    name: "Degustação no Maipo",
    tagline: "Carmenère e cabernet a meia hora da capital.",
  },
  "cata-elqui": {
    name: "Pisco e vinhedos no Elqui",
    tagline: "Moscatel, destilaria familiar e o vale na taça.",
  },
  "kayak-laja": {
    name: "Caiaque no Laja",
    tagline: "Águas do Laja, bosque e a cascata clássica do sul.",
  },
  "navegacion-marmol": {
    name: "Navegação às Capelas de Mármore",
    tagline: "Cavernas azuis no lago General Carrera.",
  },
  "sendero-alerce-chiloe": {
    name: "Trilha de alerces em Chiloé",
    tagline: "Alerce, tepú e a floresta sempre-verde do arquipélago.",
  },
  "ski-la-parva": {
    name: "Ski em La Parva",
    tagline: "Pistas familiares e fora de pista a um passo de Farellones.",
  },
  "valle-de-la-luna": {
    name: "Entardecer no Valle de la Luna",
    tagline: "Dunas, salar e o sol caindo sobre o Licancabur.",
  },
  "w-paine": {
    name: "Um dia em Base Torres",
    tagline: "O trekking clássico até as três torres de granito.",
  },
  "cerros-valpo": {
    name: "Cerros, murais e ascensores",
    tagline: "Alegre, Concepción e o porto com guia local.",
  },
  "tongariki-amanecer": {
    name: "Amanhecer em Tongariki",
    tagline: "Quinze moai contra o sol do Pacífico.",
  },
};

const fr: Record<string, ItemText> = {
  "curanto-chilote": {
    description:
      "Rituel chilote : fosse, pierres chaudes, chapaleles et fruits de mer du canal. Avec une famille locale.",
  },
  "asado-patagonico": {
    description:
      "Agneau d'estancia, chimichurri au merken et vin du Maule. Dîner dans la lumière australe.",
  },
  "cocina-mapuche": {
    description:
      "Déjeuner dans une ruka avec des productrices locales. Récit du territoire, herbes du volcan et pain de blé candeal.",
  },
  "mariscal-valpo": {
    description:
      "Caleta avec vue sur les cerros. Machas à la parmesane, ceviche de reineta et vin de Casablanca.",
  },
  "pisco-elqui": {
    description:
      "Trois arrêts : distillerie familiale, vignoble d'altitude et pisco sour au citron de Pica.",
  },
  "mercado-central": {
    description:
      "Parcours entre poissonneries, pastel de choclo et une fin à Lastarria avec un carmenère.",
  },
  "mote-con-huesillos": {
    description:
      "Le verre de l'été santiaguino : pêches séchées hydratées, mote et sirop de chancaca. Foire, plaza ou ombre de tilleul.",
  },
  "pastelitos-curacavi": {
    description:
      "Le classique de l'arrêt à Curacaví : pâte croustillante, fourrage au manjar et un voile de sucre. Café à la casserole à côté.",
  },
  sopaipillas: {
    description:
      "Disque de courge dans l'huile chaude. En hiver elles sont pasadas, en été avec pebre. La rue chilienne en une bouchée.",
  },
  "empanadas-de-pino": {
    description:
      "L'empanada des fêtes patriotiques et du dimanche. Pâte au four, pino juteux et le rituel de ne pas mordre l'olive surprise.",
  },
  "pastel-de-choclo": {
    description:
      "Cazuela de terre, pâte de maïs sucrée et pino en dessous. Le déjeuner de fundo de la Vallée Centrale, avec salade chilienne.",
  },
  humitas: {
    description:
      "Saison d'été : maïs râpé, basilic et un lien de paille. On les mange avec salade de tomate et ají.",
  },
  "caldillo-de-congrio": {
    description:
      "Soupe de congrio doré, pomme de terre, tomate et un fond de mer. Caleta, toile cirée et un blanc de Casablanca.",
  },
  "pastel-de-centolla": {
    description:
      "Chair de centolla, crème et un gratin. On la mange à l'estancia ou à la caleta, avec un blanc extrême et le vent à la fenêtre.",
  },
  mariscal: {
    description:
      "Moules, palourdes, piure, crevette et une glace qui ne pardonne pas. L'apéritif de caleta avant le plat chaud.",
  },
  cazuela: {
    description:
      "Le déjeuner de la maison chilienne. Chaque cuillerée apporte un morceau distinct. Servie fumante, avec coriandre et ají de couleur.",
  },
  charquican: {
    description:
      "Ragoût épais de légumes et viande séchée. Plat d'hiver et de campagne, avec ají et coriandre.",
  },
  "porotos-granados": {
    description:
      "Le ragoût de février. Haricots mûrs, mazamorra de maïs et une huile de couleur. On le mange avec salade chilienne.",
  },
  chorrillana: {
    description:
      "Le plat de Valparaíso. On le partage avec un verre de pipeño ou une bière, après avoir monté l'Alegre à pied.",
  },
  "astronomia-atacama": {
    name: "Astronomie dans le désert",
    tagline: "Téléscopes, Voie lactée et un récit andin du ciel.",
  },
  "sandboard-atacama": {
    name: "Sandboard dans le Valle de la Muerte",
    tagline: "Dunes de gypse, planche et le Licancabur au fond.",
  },
  "buceo-punta-choros": {
    name: "Plongée à Punta de Choros",
    tagline: "Eau claire, otaries et la réserve du manchot de Humboldt.",
  },
  "surf-pichilemu": {
    name: "Surf à Punta de Lobos",
    tagline: "La houle du Pacifique dans la capitale du surf chilien.",
  },
  "cata-colchagua": {
    name: "Dégustation de vins à Colchagua",
    tagline: "Carmenère, cabernet et la vallée dans le verre.",
  },
  "volcan-villarrica": {
    name: "Trekking au volcan Villarrica",
    tagline: "Cratère actif, crampons et vue sur les lacs.",
  },
  "ciclismo-pucon": {
    name: "Cyclisme autour du Villarrica",
    tagline: "Route lacustre, forêt d'araucaria et le cône toujours en vue.",
  },
  "termas-geometricas": {
    tagline: "Passerelles rouges, bassins d'eau volcanique et forêt.",
  },
  "kayak-siete-tazas": {
    name: "Kayak à Siete Tazas",
    tagline: "Bassins de basalte, cascades et le río Claro en kayak.",
  },
  "rafting-futaleufu": {
    name: "Rafting sur le Futaleufú",
    tagline: "Eaux vives classe IV–V sur le fleuve le plus célèbre du sud.",
  },
  "barco-peulla": {
    name: "Navigation vers Peulla",
    tagline: "Traversée de lacs, volcans et le village au fond du Todos los Santos.",
  },
  "nautico-llanquihue": {
    name: "Sports nautiques sur le Llanquihue",
    tagline: "Kayak, voile ou paddle avec l'Osorno reflété dans le lac.",
  },
  "tour-bosque-chiloe": {
    name: "Tour des forêts de Chiloé",
    tagline: "Tepú, jeune alerce, palafitos et la mythologie de l'archipel.",
  },
  "trekking-la-campana": {
    name: "Trekking à La Campana",
    tagline: "Palmier chilien, forêt sclérophylle et le cerro que Darwin a gravi.",
  },
  "ski-valle-nevado": {
    name: "Ski à Valle Nevado",
    tagline: "Pistes andines à une heure de Santiago.",
  },
  "snowboard-chillan": {
    name: "Snowboard à Chillán",
    tagline: "Neige volcanique, forêt et pistes du Nevados de Chillán.",
  },
  "geiseres-el-tatio": {
    name: "Geysers du Tatio",
    tagline: "Aube à 4 300 m, colonnes de vapeur et altiplano.",
  },
  "kayak-bahia-inglesa": {
    name: "Kayak à Bahía Inglesa",
    tagline: "Eau turquoise, désert côtier et crique de sable blanc.",
  },
  "cata-maipo": {
    name: "Dégustation dans le Maipo",
    tagline: "Carmenère et cabernet à une demi-heure de la capitale.",
  },
  "cata-elqui": {
    name: "Pisco et vignobles à Elqui",
    tagline: "Muscat, distillerie familiale et la vallée dans le verre.",
  },
  "kayak-laja": {
    name: "Kayak sur le Laja",
    tagline: "Eaux du Laja, forêt et la cascade classique du sud.",
  },
  "navegacion-marmol": {
    name: "Navigation vers les Chapelles de Marbre",
    tagline: "Cavernes bleues sur le lac General Carrera.",
  },
  "sendero-alerce-chiloe": {
    name: "Sentier d'alerce à Chiloé",
    tagline: "Alerce, tepú et la forêt sempervirente de l'archipel.",
  },
  "ski-la-parva": {
    name: "Ski à La Parva",
    tagline: "Pistes familiales et hors-piste à un pas de Farellones.",
  },
  "valle-de-la-luna": {
    name: "Coucher de soleil au Valle de la Luna",
    tagline: "Dunes, salar et le soleil qui tombe sur le Licancabur.",
  },
  "w-paine": {
    name: "Une journée à Base Torres",
    tagline: "Le trekking classique jusqu'aux trois tours de granite.",
  },
  "cerros-valpo": {
    name: "Cerros, fresques et ascenseurs",
    tagline: "Alegre, Concepción et le port avec un guide local.",
  },
  "tongariki-amanecer": {
    name: "Aube à Tongariki",
    tagline: "Quinze moai contre le soleil du Pacifique.",
  },
};

const it: Record<string, ItemText> = {
  "curanto-chilote": {
    description:
      "Rito chilote: fossa, pietre calde, chapaleles e frutti di mare del canale. Con una famiglia locale.",
  },
  "asado-patagonico": {
    description:
      "Agnello di estancia, chimichurri al merken e vino del Maule. Cena nella luce australe.",
  },
  "cocina-mapuche": {
    description:
      "Pranzo in una ruka con produttrici locali. Racconto del territorio, erbe del vulcano e pane di grano candeal.",
  },
  "mariscal-valpo": {
    description:
      "Caleta con vista sui cerros. Machas alla parmigiana, ceviche di reineta e vino di Casablanca.",
  },
  "pisco-elqui": {
    description:
      "Tre tappe: distilleria familiare, vigneto d'altura e pisco sour con limone di Pica.",
  },
  "mercado-central": {
    description:
      "Percorso tra pescherie, pastel de choclo e una chiusura a Lastarria con carmenère.",
  },
  "mote-con-huesillos": {
    description:
      "Il bicchiere dell'estate santiaguina: pesche secche idratate, mote e uno sciroppo di chancaca. Fiera, piazza o ombra di tiglio.",
  },
  "pastelitos-curacavi": {
    description:
      "Il classico della sosta a Curacaví: pasta croccante, ripieno di manjar e una polvere di zucchero. Caffè di pentola accanto.",
  },
  sopaipillas: {
    description:
      "Disco di zucca nell'olio caldo. In inverno vanno pasadas, in estate con pebre. La strada cilena in un boccone.",
  },
  "empanadas-de-pino": {
    description:
      "L'empanada delle feste patriottiche e della domenica. Pasta al forno, pino succoso e il rito di non mordere l'oliva a sorpresa.",
  },
  "pastel-de-choclo": {
    description:
      "Cazuela di terracotta, pasta di mais dolce e pino sotto. Il pranzo di fundo della Valle Centrale, con insalata cilena.",
  },
  humitas: {
    description:
      "Stagione d'estate: mais grattugiato, basilico e un legaccio di paglia. Si mangiano con insalata di pomodoro e ají.",
  },
  "caldillo-de-congrio": {
    description:
      "Zuppa di congrio dorato, patata, pomodoro e un fondo di mare. Caleta, tovaglia di tela cerata e un bianco di Casablanca.",
  },
  "pastel-de-centolla": {
    description:
      "Carne di centolla, panna e un gratinato. Si mangia in estancia o caleta, con un bianco estremo e vento alla finestra.",
  },
  mariscal: {
    description:
      "Cozze, vongole, piure, gambero e un ghiaccio che non perdona. L'aperitivo di caleta prima del piatto caldo.",
  },
  cazuela: {
    description:
      "Il pranzo di casa cilena. Ogni cucchiaio porta un pezzo diverso. Si serve fumante, con coriandolo e ají di colore.",
  },
  charquican: {
    description:
      "Stufato denso di verdura e carne secca. Piatto d'inverno e di campagna, con ají e coriandolo.",
  },
  "porotos-granados": {
    description:
      "Lo stufato di febbraio. Fagioli maturi, mazamorra di mais e un olio di colore. Si mangia con insalata cilena.",
  },
  chorrillana: {
    description:
      "Il piatto di Valparaíso. Si condivide con un bicchiere di pipeño o una birra, dopo aver salito l'Alegre a piedi.",
  },
  "astronomia-atacama": {
    name: "Astronomia nel deserto",
    tagline: "Telescopi, Via Lattea e un racconto andino del cielo.",
  },
  "sandboard-atacama": {
    name: "Sandboard a Valle de la Muerte",
    tagline: "Dune di gesso, tavola e il Licancabur sullo sfondo.",
  },
  "buceo-punta-choros": {
    name: "Immersioni a Punta de Choros",
    tagline: "Acqua chiara, leoni marini e la Riserva del pinguino di Humboldt.",
  },
  "surf-pichilemu": {
    name: "Surf a Punta de Lobos",
    tagline: "Lo swell del Pacifico nella capitale del surf cileno.",
  },
  "cata-colchagua": {
    name: "Degustazione di vini a Colchagua",
    tagline: "Carmenère, cabernet e la valle nel calice.",
  },
  "volcan-villarrica": {
    name: "Trekking sul vulcano Villarrica",
    tagline: "Cratere attivo, ramponi e vista sui laghi.",
  },
  "ciclismo-pucon": {
    name: "Ciclismo intorno al Villarrica",
    tagline: "Percorso lacustre, bosco di araucaria e il cono sempre in vista.",
  },
  "termas-geometricas": {
    tagline: "Passerelle rosse, pozze di acqua vulcanica e bosco.",
  },
  "kayak-siete-tazas": {
    name: "Kayak a Siete Tazas",
    tagline: "Pozze di basalto, cascate e il fiume Claro in kayak.",
  },
  "rafting-futaleufu": {
    name: "Rafting sul Futaleufú",
    tagline: "Acque bianche classe IV–V sul fiume più famoso del sud.",
  },
  "barco-peulla": {
    name: "Navigazione a Peulla",
    tagline: "Traversata di laghi, vulcani e il villaggio in fondo al Todos los Santos.",
  },
  "nautico-llanquihue": {
    name: "Sport nautici sul Llanquihue",
    tagline: "Kayak, vela o paddle con l'Osorno riflesso nel lago.",
  },
  "tour-bosque-chiloe": {
    name: "Tour nei boschi di Chiloé",
    tagline: "Tepú, alerce giovane, palafitos e la mitologia dell'arcipelago.",
  },
  "trekking-la-campana": {
    name: "Trekking a La Campana",
    tagline: "Palma cilena, bosco sclerofillo e il cerro che Darwin salì.",
  },
  "ski-valle-nevado": {
    name: "Sci a Valle Nevado",
    tagline: "Piste andine a un'ora da Santiago.",
  },
  "snowboard-chillan": {
    name: "Snowboard a Chillán",
    tagline: "Neve vulcanica, bosco e piste del Nevados de Chillán.",
  },
  "geiseres-el-tatio": {
    name: "Geyser del Tatio",
    tagline: "Alba a 4.300 m, colonne di vapore e altopiano.",
  },
  "kayak-bahia-inglesa": {
    name: "Kayak a Bahía Inglesa",
    tagline: "Acqua turchese, deserto costiero e caletta di sabbia bianca.",
  },
  "cata-maipo": {
    name: "Degustazione nel Maipo",
    tagline: "Carmenère e cabernet a mezz'ora dalla capitale.",
  },
  "cata-elqui": {
    name: "Pisco e vigneti a Elqui",
    tagline: "Moscato, distilleria familiare e la valle nel calice.",
  },
  "kayak-laja": {
    name: "Kayak sul Laja",
    tagline: "Acque del Laja, bosco e la cascata classica del sud.",
  },
  "navegacion-marmol": {
    name: "Navigazione alle Cappelle di Marmo",
    tagline: "Caverne azzurre sul lago General Carrera.",
  },
  "sendero-alerce-chiloe": {
    name: "Sentiero di alerce a Chiloé",
    tagline: "Alerce, tepú e la foresta sempreverde dell'arcipelago.",
  },
  "ski-la-parva": {
    name: "Sci a La Parva",
    tagline: "Piste familiari e fuoripista a un passo da Farellones.",
  },
  "valle-de-la-luna": {
    name: "Tramonto a Valle de la Luna",
    tagline: "Dune, salar e il sole che cade sul Licancabur.",
  },
  "w-paine": {
    name: "Un giorno a Base Torres",
    tagline: "Il trekking classico fino alle tre torri di granito.",
  },
  "cerros-valpo": {
    name: "Cerros, murales e ascensori",
    tagline: "Alegre, Concepción e il porto con guida locale.",
  },
  "tongariki-amanecer": {
    name: "Alba a Tongariki",
    tagline: "Quindici moai contro il sole del Pacifico.",
  },
};

const byLocale: Record<Exclude<Locale, "es">, Record<string, ItemText>> = {
  en,
  pt,
  fr,
  it,
};

export function localizeItem(item: CatalogItem, locale: Locale): CatalogItem {
  if (locale === "es") return item;
  const extra = byLocale[locale]?.[item.slug];
  if (!extra) return item;
  return {
    ...item,
    name: extra.name ?? item.name,
    tagline: extra.tagline ?? item.tagline,
    description: extra.description ?? item.description,
  };
}
