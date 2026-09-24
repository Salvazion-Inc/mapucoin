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
  completo: {
    description:
      "Chile's hot dog. The italiano comes with avocado, tomato and mayonnaise. Eaten standing up, at night, downtown.",
  },
  choripan: {
    description:
      "The asado in a bun. Marked sausage, toasted marraqueta and pebre or ají. It shows up at fondas, fairs and Sundays.",
  },
  "pastel-de-jaiba": {
    description:
      "Crab meat, soaked bread and cheese from the oven. The caleta plate when the Pacific is rough.",
  },
  cancato: {
    description:
      "The Chilote oven: an opened fish, longaniza, cheese and tomato. Shared at the table, with pan amasado.",
  },
  "pan-amasado": {
    description:
      "The fundo's first plate. Hot pan amasado, pebre with cilantro and ají, and a glass of pipeño on Sunday.",
  },
  "porotos-con-riendas": {
    description:
      "The winter stew of the Central Valley. The riendas are the noodles. Served with ají and a Chilean salad.",
  },
  plateada: {
    description:
      "Hours in the oven or the pot. The beef falls apart and the juice is for the mash. Sunday lunch in the country.",
  },
  "kuchen-de-frambuesa": {
    description:
      "The once of Puerto Varas and Frutillar. Raspberry, murta or apple kuchen, with a cup of coffee.",
  },
  milcao: {
    description:
      "Chilote potato bread. Raw and cooked potato in the same dough, with cracklings if the house has them.",
  },
  "palta-reina": {
    description:
      "A Chilean restaurant starter for decades. Half an avocado, shredded chicken and mayonnaise.",
  },
  "trucha-a-la-mantequilla": {
    description:
      "Lunch on the southern rivers. Just-caught trout, browned butter and potatoes. Eaten looking at the water.",
  },
  patasca: {
    description:
      "Andean soup of hominy and meat, food for altitude and cold. In the north it is served steaming, with ají.",
  },
  "marraqueta-palta-pebre": {
    description:
      "What fits in a pack and in a refuge. Marraqueta, mashed avocado and pebre. Chilean once when there is no kitchen.",
  },
  "pisco-sour": {
    description:
      "Chile's drink. In Elqui it is taken with Pica lime, at dusk, after the distillery.",
  },
  terremoto: {
    description:
      "The glass of the fonda and the 18th. Pipeño, pineapple ice cream and, if the night goes on, a smaller replica.",
  },
  borgona: {
    description:
      "Mixed in a jug: red wine, strawberries and ice. It appears at New Year, on the beach and at January lunch.",
  },
  navegado: {
    description:
      "The southern drink when it rains or when there is snow. Red wine, orange peel and a stick of cinnamon.",
  },
  "cola-de-mono": {
    description:
      "Made at home for the 24th. Milk, coffee, sugar, clove and aguardiente. Served cold, in a small glass.",
  },
  "chicha-de-manzana": {
    description:
      "The archipelago's cider. Crushed apple, a short ferment and a glass at the fair or at the family house.",
  },
  pipeno: {
    description:
      "Red or white, without aging, from a jug or a glass. It goes with the asado, the empanada and Sunday in the valley.",
  },
  "papaya-sour": {
    description:
      "The sour of the Coquimbo coast. Papaya in syrup, pisco and lime. Ordered on Avenida del Mar.",
  },
  muday: {
    description:
      "Mapuche drink of wheat, corn or piñón. Offered in the ruka, with the story and the hearth meal.",
  },
  piscola: {
    description:
      "The most ordered drink in the country. Pisco, ice and a cola. Taken at the bar, at home and after the asado.",
  },
  vaina: {
    description:
      "An old-bar cocktail. Fortified wine, cognac, yolk and a cloud. Ordered in the afternoon in Valparaíso.",
  },
  "licor-de-oro": {
    description:
      "Made on the island: whey, aguardiente and a thread of saffron. Sweet, gold and a small glass at the end of the meal.",
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
  completo: {
    description:
      "O hot dog do Chile. Na versão italiano leva abacate, tomate e maionese. Come-se de pé, à noite, no centro.",
  },
  choripan: {
    description:
      "O assado num pão. Linguiça marcada, marraqueta tostada e pebre ou ají. Aparece em fondas, feiras e domingos.",
  },
  "pastel-de-jaiba": {
    description:
      "Carne de jaiba, pão ensopado e queijo ao forno. O prato da caleta quando o Pacífico está bravo.",
  },
  cancato: {
    description:
      "O forno chilote: um peixe aberto, longaniza, queijo e tomate. Parte-se na mesa, com pan amasado.",
  },
  "pan-amasado": {
    description:
      "A entrada do fundo. Pan amasado quente, pebre com coentro e ají, e um copo de pipeño ao domingo.",
  },
  "porotos-con-riendas": {
    description:
      "O guisado de inverno do Vale Central. As riendas são o macarrão. Serve-se com ají e salada chilena.",
  },
  plateada: {
    description:
      "Horas de forno ou de panela. A carne desfaz-se e o caldo fica para o puré. Almoço de domingo no campo.",
  },
  "kuchen-de-frambuesa": {
    description:
      "A once de Puerto Varas e Frutillar. Kuchen de framboesa, murta ou maçã, com café.",
  },
  milcao: {
    description:
      "O pão de batata chilote. Batata crua e cozida na mesma massa, com torresmo se a casa tiver.",
  },
  "palta-reina": {
    description:
      "Entrada de restaurante chileno há décadas. Meio abacate, frango desfiado e maionese.",
  },
  "trucha-a-la-mantequilla": {
    description:
      "O almoço dos rios do sul. Truta acabada de pescar, manteiga e batatas. Come-se a olhar a água.",
  },
  patasca: {
    description:
      "Sopa andina de milho descascado e carne, comida de altitude e de frio. No norte serve-se a fumegar, com ají.",
  },
  "marraqueta-palta-pebre": {
    description:
      "O que cabe na mochila e no refúgio. Marraqueta, abacate amassado e pebre. A once chilena quando não há cozinha.",
  },
  "pisco-sour": {
    description:
      "O trago do Chile. No Elqui bebe-se com limão de Pica, ao anoitecer, depois da destilaria.",
  },
  terremoto: {
    description:
      "O copo da fonda e do 18. Pipeño, gelado de ananás e, se a noite continua, uma réplica mais pequena.",
  },
  borgona: {
    description:
      "Prepara-se numa jarra: tinto, morangos e gelo. Aparece no ano novo, na praia e no almoço de janeiro.",
  },
  navegado: {
    description:
      "O trago do sul quando chove ou quando há neve. Tinto, casca de laranja e um pau de canela.",
  },
  "cola-de-mono": {
    description:
      "Prepara-se em casa para o dia 24. Leite, café, açúcar, cravo e aguardiente. Serve-se frio, em copo pequeno.",
  },
  "chicha-de-manzana": {
    description:
      "A sidra do arquipélago. Maçã moída, fermento curto e um copo na feira ou na casa da família.",
  },
  pipeno: {
    description:
      "Tinto ou branco, sem estágio, em garrafão ou em copo. Acompanha o assado, a empanada e o domingo no vale.",
  },
  "papaya-sour": {
    description:
      "O sour da costa de Coquimbo. Papaia em calda, pisco e limão. Pede-se na Avenida del Mar.",
  },
  muday: {
    description:
      "Bebida mapuche de trigo, milho ou piñón. Oferece-se na ruka, com o relato e a comida do fogão.",
  },
  piscola: {
    description:
      "O trago mais pedido do país. Pisco, gelo e uma cola. Bebe-se no bar, em casa e depois do assado.",
  },
  vaina: {
    description:
      "Coquetel de balcão antigo. Vinho generoso, conhaque, gema e uma nuvem. Pede-se à tarde em Valparaíso.",
  },
  "licor-de-oro": {
    description:
      "Faz-se na ilha: soro, aguardiente e um fio de açafrão. Doce, dourado e de copo pequeno no fim da refeição.",
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
  completo: {
    description:
      "Le hot-dog du Chili. La version italiano porte avocat, tomate et mayonnaise. On le mange debout, le soir, au centre.",
  },
  choripan: {
    description:
      "L'asado dans un pain. Saucisse marquée, marraqueta grillée et pebre ou ají. Il apparaît aux fondas, aux foires et le dimanche.",
  },
  "pastel-de-jaiba": {
    description:
      "Chair de crabe, pain trempé et fromage au four. Le plat de caleta quand le Pacifique est dur.",
  },
  cancato: {
    description:
      "Le four chilote : un poisson ouvert, longaniza, fromage et tomate. On le partage à table, avec du pan amasado.",
  },
  "pan-amasado": {
    description:
      "L'entrée du fundo. Pan amasado chaud, pebre au coriandre et à l'ají, et un verre de pipeño le dimanche.",
  },
  "porotos-con-riendas": {
    description:
      "Le ragoût d'hiver de la Vallée Centrale. Les riendas sont les nouilles. On le sert avec de l'ají et une salade chilienne.",
  },
  plateada: {
    description:
      "Des heures de four ou de marmite. La viande se défait et le jus est pour la purée. Déjeuner du dimanche à la campagne.",
  },
  "kuchen-de-frambuesa": {
    description:
      "L'once de Puerto Varas et Frutillar. Kuchen de framboise, de murta ou de pomme, avec un café.",
  },
  milcao: {
    description:
      "Le pain de pomme de terre chilote. Pomme de terre crue et cuite dans la même pâte, avec des grattons si la maison en a.",
  },
  "palta-reina": {
    description:
      "Entrée de restaurant chilien depuis des décennies. Demi-avocat, poulet effiloché et mayonnaise.",
  },
  "trucha-a-la-mantequilla": {
    description:
      "Le déjeuner des rivières du sud. Truite tout juste pêchée, beurre et pommes de terre. On la mange en regardant l'eau.",
  },
  patasca: {
    description:
      "Soupe andine de maïs pelé et de viande, plat d'altitude et de froid. Dans le nord on la sert fumante, avec de l'ají.",
  },
  "marraqueta-palta-pebre": {
    description:
      "Ce qui tient dans le sac et dans le refuge. Marraqueta, avocat écrasé et pebre. L'once chilienne quand il n'y a pas de cuisine.",
  },
  "pisco-sour": {
    description:
      "Le verre du Chili. Dans l'Elqui on le boit au citron de Pica, au crépuscule, après la distillerie.",
  },
  terremoto: {
    description:
      "Le verre de la fonda et du 18. Pipeño, glace à l'ananas et, si la nuit continue, une réplique plus petite.",
  },
  borgona: {
    description:
      "Préparé en pichet : vin rouge, fraises et glace. Il apparaît au nouvel an, à la plage et au déjeuner de janvier.",
  },
  navegado: {
    description:
      "Le verre du sud quand il pleut ou quand il neige. Vin rouge, zeste d'orange et un bâton de cannelle.",
  },
  "cola-de-mono": {
    description:
      "Préparé à la maison pour le 24. Lait, café, sucre, clou de girofle et aguardiente. Servi froid, dans un petit verre.",
  },
  "chicha-de-manzana": {
    description:
      "Le cidre de l'archipel. Pomme broyée, fermentation courte et un verre à la foire ou dans la maison de la famille.",
  },
  pipeno: {
    description:
      "Rouge ou blanc, sans élevage, en dame-jeanne ou en verre. Il accompagne l'asado, l'empanada et le dimanche dans la vallée.",
  },
  "papaya-sour": {
    description:
      "Le sour de la côte de Coquimbo. Papaye au sirop, pisco et citron. On le commande sur l'Avenida del Mar.",
  },
  muday: {
    description:
      "Boisson mapuche de blé, de maïs ou de piñón. Offerte dans la ruka, avec le récit et le repas du foyer.",
  },
  piscola: {
    description:
      "Le verre le plus commandé du pays. Pisco, glace et un cola. On le boit au bar, à la maison et après l'asado.",
  },
  vaina: {
    description:
      "Cocktail de vieux comptoir. Vin doux, cognac, jaune d'œuf et un nuage. Commandé l'après-midi à Valparaíso.",
  },
  "licor-de-oro": {
    description:
      "Fait sur l'île : petit-lait, aguardiente et un fil de safran. Doux, doré et un petit verre en fin de repas.",
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
  completo: {
    description:
      "L'hot dog del Cile. Nella versione italiano porta avocado, pomodoro e maionese. Si mangia in piedi, di notte, in centro.",
  },
  choripan: {
    description:
      "L'asado in un pane. Salsiccia segnata, marraqueta tostata e pebre o ají. Compare alle fondas, alle fiere e la domenica.",
  },
  "pastel-de-jaiba": {
    description:
      "Polpa di granchio, pane ammollato e formaggio al forno. Il piatto di caleta quando il Pacifico è duro.",
  },
  cancato: {
    description:
      "Il forno chilota: un pesce aperto, longaniza, formaggio e pomodoro. Si condivide a tavola, con pan amasado.",
  },
  "pan-amasado": {
    description:
      "L'ingresso del fundo. Pan amasado caldo, pebre con coriandolo e ají, e un bicchiere di pipeño la domenica.",
  },
  "porotos-con-riendas": {
    description:
      "Lo stufato d'inverno della Valle Centrale. Le riendas sono la pasta. Si serve con ají e insalata cilena.",
  },
  plateada: {
    description:
      "Ore di forno o di pentola. La carne si sfalda e il sugo è per il purè. Pranzo della domenica in campagna.",
  },
  "kuchen-de-frambuesa": {
    description:
      "L'once di Puerto Varas e Frutillar. Kuchen di lampone, murta o mela, con un caffè.",
  },
  milcao: {
    description:
      "Il pane di patata chilota. Patata cruda e cotta nello stesso impasto, con ciccioli se la casa ne ha.",
  },
  "palta-reina": {
    description:
      "Antipasto da ristorante cileno da decenni. Mezzo avocado, pollo sfilacciato e maionese.",
  },
  "trucha-a-la-mantequilla": {
    description:
      "Il pranzo dei fiumi del sud. Trota appena pescata, burro e patate. Si mangia guardando l'acqua.",
  },
  patasca: {
    description:
      "Zuppa andina di mais pelato e carne, cibo di altitudine e di freddo. Al nord si serve fumante, con ají.",
  },
  "marraqueta-palta-pebre": {
    description:
      "Quello che entra nello zaino e nel rifugio. Marraqueta, avocado schiacciato e pebre. L'once cilena quando non c'è cucina.",
  },
  "pisco-sour": {
    description:
      "Il bicchiere del Cile. Nell'Elqui si beve con lime di Pica, al tramonto, dopo la distilleria.",
  },
  terremoto: {
    description:
      "Il bicchiere della fonda e del 18. Pipeño, gelato all'ananas e, se la notte continua, una replica più piccola.",
  },
  borgona: {
    description:
      "Si prepara in brocca: rosso, fragole e ghiaccio. Compare a capodanno, in spiaggia e a pranzo a gennaio.",
  },
  navegado: {
    description:
      "Il bicchiere del sud quando piove o quando c'è neve. Rosso, scorza d'arancia e una stecca di cannella.",
  },
  "cola-de-mono": {
    description:
      "Si prepara in casa per il 24. Latte, caffè, zucchero, chiodo di garofano e aguardiente. Si serve freddo, in un bicchiere piccolo.",
  },
  "chicha-de-manzana": {
    description:
      "Il sidro dell'arcipelago. Mela macinata, fermento breve e un bicchiere alla fiera o in casa della famiglia.",
  },
  pipeno: {
    description:
      "Rosso o bianco, senza affinamento, in damigiana o in bicchiere. Accompagna l'asado, l'empanada e la domenica in valle.",
  },
  "papaya-sour": {
    description:
      "Il sour della costa di Coquimbo. Papaya sciroppata, pisco e lime. Si ordina sull'Avenida del Mar.",
  },
  muday: {
    description:
      "Bevanda mapuche di grano, mais o piñón. Si offre nella ruka, con il racconto e il pasto del focolare.",
  },
  piscola: {
    description:
      "Il bicchiere più ordinato del paese. Pisco, ghiaccio e una cola. Si beve al bar, a casa e dopo l'asado.",
  },
  vaina: {
    description:
      "Cocktail da banco antico. Vino liquoroso, cognac, tuorlo e una nuvola. Si ordina nel pomeriggio a Valparaíso.",
  },
  "licor-de-oro": {
    description:
      "Si fa sull'isola: siero, aguardiente e un filo di zafferano. Dolce, dorato e un bicchierino a fine pasto.",
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

const de: Record<string, ItemText> = {
  "curanto-chilote": {
    description:
      "Chilotes Ritual: Grube, heiße Steine, Chapaleles und Meeresfrüchte aus dem Kanal. Mit einer lokalen Familie.",
  },
  "asado-patagonico": {
    description:
      "Lamm von der Estancia, Merkén-Chimichurri und Wein aus dem Maule. Abendessen in der südlichen Dämmerung.",
  },
  "cocina-mapuche": {
    description:
      "Mittagessen in einer Ruka mit lokalen Erzeugerinnen. Geschichte des Gebiets, Kräuter vom Vulkan und Brot aus Candeal-Weizen.",
  },
  "mariscal-valpo": {
    description:
      "Caleta mit Blick auf die Hügel. Machas a la parmesana, Ceviche aus Reineta und Wein aus Casablanca.",
  },
  "pisco-elqui": {
    description:
      "Drei Stationen: Familienbrennerei, hoher Weinberg und Pisco Sour mit Pica-Limette.",
  },
  "mercado-central": {
    description:
      "Ein Gang durch die Fischstände, Pastel de choclo und ein Abschluss in Lastarria mit Carménère.",
  },
  "mote-con-huesillos": {
    description:
      "Das Glas eines Sommers in Santiago: eingeweichte getrocknete Pfirsiche, Weizen-Mote und Chancaca-Sirup. Markt, Plaza oder Schatten einer Linde.",
  },
  "pastelitos-curacavi": {
    description:
      "Der klassische Halt auf dem Weg nach Curacaví: knuspriger Teig, Manjar und Puderzucker. Dazu Kaffee aus der Kanne.",
  },
  sopaipillas: {
    description:
      "Eine Scheibe Kürbisteig im heißen Öl. Im Winter pasadas, im Sommer mit Pebre. Die chilenische Straße in einem Bissen.",
  },
  "empanadas-de-pino": {
    description:
      "Die Empanada der Nationalfeiertage und Sonntage. Ofenteig, saftiges Pino und das Ritual, nicht in die überraschende Olive zu beißen.",
  },
  "pastel-de-choclo": {
    description:
      "Tontopf, süßer Maisbrei und darunter Pino. Das Fundo-Mittagessen des Zentraltals, mit chilenischem Salat.",
  },
  humitas: {
    description:
      "Sommersaison: geriebener Mais, Basilikum und eine Schnur aus Stroh. Dazu Tomatensalat und Ají.",
  },
  "caldillo-de-congrio": {
    description:
      "Goldene Congrio-Suppe, Kartoffel, Tomate und eine Meeresbrühe. Caleta, Wachstuch und ein Weißwein aus Casablanca.",
  },
  "pastel-de-centolla": {
    description:
      "Königskrabbenfleisch, Sahne und Gratin. Auf einer Estancia oder in der Caleta, mit einem kräftigen Weißwein und Wind am Fenster.",
  },
  mariscal: {
    description:
      "Muscheln, Venusmuscheln, Piure, Garnelen und Eis, das keine Gnade kennt. Der Aperitif der Caleta vor dem warmen Teller.",
  },
  cazuela: {
    description:
      "Das Mittagessen eines chilenischen Hauses. Jeder Löffel bringt ein anderes Stück. Dampfend serviert, mit Koriander und farbigem Ají.",
  },
  charquican: {
    description:
      "Ein dicker Eintopf aus Gemüse und Dörrfleisch. Ein Winter- und Landteller, mit Ají und Koriander.",
  },
  "porotos-granados": {
    description:
      "Der Eintopf des Februars. Reife Bohnen, Maisbrei und farbiges Öl. Dazu chilenischer Salat.",
  },
  chorrillana: {
    description:
      "Die Platte von Valparaíso. Geteilt mit Pipeño oder einem Bier, nach dem Aufstieg zum Cerro Alegre.",
  },
  completo: {
    description:
      "Der Hotdog Chiles. Die Version italiano trägt Avocado, Tomate und Mayonnaise. Man isst ihn im Stehen, nachts, im Zentrum.",
  },
  choripan: {
    description:
      "Das Asado im Brot. Gezeichnete Wurst, geröstete Marraqueta und Pebre oder Ají. Er erscheint auf Fondas, Märkten und sonntags.",
  },
  "pastel-de-jaiba": {
    description:
      "Krabbenfleisch, eingeweichtes Brot und Käse aus dem Ofen. Das Caleta-Gericht, wenn der Pazifik rau ist.",
  },
  cancato: {
    description:
      "Der chilotische Ofen: ein geöffneter Fisch, Longaniza, Käse und Tomate. Geteilt am Tisch, mit Pan amasado.",
  },
  "pan-amasado": {
    description:
      "Der erste Gang des Fundo. Heißes Pan amasado, Pebre mit Koriander und Ají, und sonntags ein Glas Pipeño.",
  },
  "porotos-con-riendas": {
    description:
      "Der Wintereintopf des Zentraltals. Die Riendas sind die Nudeln. Serviert mit Ají und chilenischem Salat.",
  },
  plateada: {
    description:
      "Stunden im Ofen oder im Topf. Das Fleisch zerfällt und der Saft ist für den Püree. Sonntagsessen auf dem Land.",
  },
  "kuchen-de-frambuesa": {
    description:
      "Die Once von Puerto Varas und Frutillar. Kuchen mit Himbeere, Murta oder Apfel, dazu Kaffee.",
  },
  milcao: {
    description:
      "Chilotisches Kartoffelbrot. Rohe und gekochte Kartoffel im selben Teig, mit Grieben, wenn das Haus sie hat.",
  },
  "palta-reina": {
    description:
      "Seit Jahrzehnten eine chilenische Restaurantvorspeise. Halbe Avocado, gezupftes Huhn und Mayonnaise.",
  },
  "trucha-a-la-mantequilla": {
    description:
      "Das Mittagessen an den Flüssen des Südens. Frisch gefangene Forelle, Butter und Kartoffeln. Gegessen mit Blick aufs Wasser.",
  },
  patasca: {
    description:
      "Andine Suppe aus geschältem Mais und Fleisch, Essen für Höhe und Kälte. Im Norden dampfend serviert, mit Ají.",
  },
  "marraqueta-palta-pebre": {
    description:
      "Was in den Rucksack und in die Hütte passt. Marraqueta, zerdrückte Avocado und Pebre. Chilenische Once ohne Küche.",
  },
  "pisco-sour": {
    description:
      "Das Glas Chiles. Im Elqui trinkt man ihn mit Pica-Limette, in der Dämmerung, nach der Destillerie.",
  },
  terremoto: {
    description:
      "Das Glas der Fonda und des 18. Pipeño, Ananaseis und, wenn die Nacht weitergeht, eine kleinere Réplica.",
  },
  borgona: {
    description:
      "In einer Kanne gemischt: Rotwein, Erdbeeren und Eis. Erscheint zu Neujahr, am Strand und beim Januar-Mittagessen.",
  },
  navegado: {
    description:
      "Das Glas des Südens, wenn es regnet oder schneit. Rotwein, Orangenschale und ein Zimtstück.",
  },
  "cola-de-mono": {
    description:
      "Zu Hause für den 24. zubereitet. Milch, Kaffee, Zucker, Nelke und Aguardiente. Kalt serviert, im kleinen Glas.",
  },
  "chicha-de-manzana": {
    description:
      "Der Apfelwein des Archipels. Gemahlener Apfel, kurze Gärung und ein Glas auf dem Markt oder im Haus der Familie.",
  },
  pipeno: {
    description:
      "Rot oder weiß, ohne Ausbau, aus der Korbflasche oder dem Glas. Begleitet Asado, Empanada und den Sonntag im Tal.",
  },
  "papaya-sour": {
    description:
      "Der Sour der Küste von Coquimbo. Papaya im Sirup, Pisco und Limette. Bestellt an der Avenida del Mar.",
  },
  muday: {
    description:
      "Mapuche-Getränk aus Weizen, Mais oder Piñón. In der Ruka angeboten, mit der Erzählung und dem Essen vom Feuer.",
  },
  piscola: {
    description:
      "Das meistbestellte Glas des Landes. Pisco, Eis und eine Cola. In der Bar, zu Hause und nach dem Asado.",
  },
  vaina: {
    description:
      "Cocktail alter Theken. Likörwein, Cognac, Eigelb und eine Wolke. Nachmittags in Valparaíso bestellt.",
  },
  "licor-de-oro": {
    description:
      "Auf der Insel gemacht: Molke, Aguardiente und ein Safranfaden. Süß, golden und ein kleines Glas zum Schluss.",
  },
  "astronomia-atacama": {
    name: "Astronomie in der Wüste",
    tagline: "Teleskope, die Milchstraße und eine andine Erzählung des Himmels.",
  },
  "sandboard-atacama": {
    name: "Sandboard im Valle de la Muerte",
    tagline: "Gipsdünen, ein Board und der Licancabur im Hintergrund.",
  },
  "buceo-punta-choros": {
    name: "Tauchen an der Punta de Choros",
    tagline: "Klares Wasser, Seelöwen und das Humboldt-Pinguin-Reservat.",
  },
  "surf-pichilemu": {
    name: "Surfen an der Punta de Lobos",
    tagline: "Pazifikwelle in der Hauptstadt des chilenischen Surfens.",
  },
  "cata-colchagua": {
    name: "Weinprobe in Colchagua",
    tagline: "Carménère, Cabernet und das Tal im Glas.",
  },
  "volcan-villarrica": {
    name: "Trekking auf den Villarrica",
    tagline: "Aktiver Krater, Steigeisen und Blick auf die Seen.",
  },
  "ciclismo-pucon": {
    name: "Radfahren um den Villarrica",
    tagline: "Seeroute, Araukarienwald und immer der Kegel im Blick.",
  },
  "termas-geometricas": {
    name: "Termas Geométricas",
    tagline: "Rote Stege, vulkanische Becken und Wald.",
  },
  "kayak-siete-tazas": {
    name: "Kajak in Siete Tazas",
    tagline: "Basaltbecken, Wasserfälle und der Río Claro im Kajak.",
  },
  "rafting-futaleufu": {
    name: "Rafting auf dem Futaleufú",
    tagline: "Wildwasser der Klasse IV–V auf dem berühmtesten Fluss des Südens.",
  },
  "barco-peulla": {
    name: "Schifffahrt nach Peulla",
    tagline: "Seeüberfahrt, Vulkane und das Dorf am Ende des Todos los Santos.",
  },
  "nautico-llanquihue": {
    name: "Wassersport auf dem Llanquihue",
    tagline: "Kajak, Segeln oder Paddeln mit dem Osorno im See.",
  },
  "tour-bosque-chiloe": {
    name: "Tour durch die Wälder von Chiloé",
    tagline: "Tepú, junge Alerce, Palafitos und die Mythologie des Archipels.",
  },
  "trekking-la-campana": {
    name: "Trekking in La Campana",
    tagline: "Chilenische Palme, Hartlaubwald und der Hügel, den Darwin bestieg.",
  },
  "ski-valle-nevado": {
    name: "Ski im Valle Nevado",
    tagline: "Andine Pisten, eine Stunde von Santiago.",
  },
  "snowboard-chillan": {
    name: "Snowboard in Chillán",
    tagline: "Vulkanischer Schnee, Wald und die Pisten der Nevados de Chillán.",
  },
  "geiseres-el-tatio": {
    name: "Geysire El Tatio",
    tagline: "Sonnenaufgang auf 4.300 m, Dampfsäulen und das Altiplano.",
  },
  "kayak-bahia-inglesa": {
    name: "Kajak in der Bahía Inglesa",
    tagline: "Türkises Wasser, Küstenwüste und eine Bucht aus weißem Sand.",
  },
  "cata-maipo": {
    name: "Weinprobe im Maipo",
    tagline: "Carménère und Cabernet, eine halbe Stunde von der Hauptstadt.",
  },
  "cata-elqui": {
    name: "Pisco und Weinberge im Elqui",
    tagline: "Muskat, eine Familienbrennerei und das Tal im Glas.",
  },
  "kayak-laja": {
    name: "Kajak auf dem Laja",
    tagline: "Wasser des Laja, Wald und der klassische Wasserfall des Südens.",
  },
  "navegacion-marmol": {
    name: "Fahrt zu den Marmorkapellen",
    tagline: "Blaue Höhlen auf dem Lago General Carrera.",
  },
  "sendero-alerce-chiloe": {
    name: "Alerce-Pfad in Chiloé",
    tagline: "Alerce, Tepú und der immergrüne Wald des Archipels.",
  },
  "ski-la-parva": {
    name: "Ski in La Parva",
    tagline: "Familienpisten und Gelände direkt bei Farellones.",
  },
  "valle-de-la-luna": {
    name: "Sonnenuntergang im Valle de la Luna",
    tagline: "Dünen, Salzwüste und die Sonne, die auf den Licancabur fällt.",
  },
  "w-paine": {
    name: "Ein Tag an der Base Torres",
    tagline: "Das klassische Trekking zu den drei Granittürmen.",
  },
  "cerros-valpo": {
    name: "Hügel, Murals und Aufzüge",
    tagline: "Alegre, Concepción und der Hafen mit lokalem Guide.",
  },
  "tongariki-amanecer": {
    name: "Sonnenaufgang in Tongariki",
    tagline: "Fünfzehn Moai gegen die Sonne des Pazifiks.",
  },
};

const byLocale: Record<Exclude<Locale, "es">, Record<string, ItemText>> = {
  en,
  pt,
  fr,
  it,
  de,
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
