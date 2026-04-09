import evidenceData from '../data/evidence.json';

const TYPING_DELAY = 2000;

const SUSPECT_RESPONSES = {
  'victor-dragos': {
    keywords: [
      { match: ['criminal', 'faptas', 'făptaș', 'vinovat', 'ucis'], response: "Acuzații grave... ai dovezi sau doar vorbe aruncate în vânt?" },
      { match: ['elena', 'chelnerita', 'chelneriță'], response: "Elena? Ea nu știe nimic. Sau poate știe prea mult. Întreab-o singur." },
      { match: ['corbu', 'mihai', 'intermediar'], response: "Corbu e un câine de pază. Nu mușcă decât dacă i se ordonă. Întrebarea e: cine dă ordinele?" },
      { match: ['recunoaste', 'recunoaște', 'recunosti', 'recunoști', 'admit'], response: "Nu am ce să recunosc. Eu sunt doar mesagerul aici." },
      { match: ['container', 'port'], response: "Uite ce am extras din containerul roșu. O fotografie compromițătoare.", evidence: 'VD-001' },
      { match: ['depozit', 'martor', 'martori'], response: "Am găsit asta în depozit, lângă locul unde au fost văzuți ultima dată. Ascultă cu atenție.", evidence: 'VD-002' },
      { match: ['dosar', 'dovezi', 'probe', 'document', 'raport'], response: "Dosarul nu există oficial... dar uite ce am scos din arhivă.", evidence: 'VD-003' },
      { match: ['pericol', 'amenintare', 'amenințare', 'risc', 'bilet'], response: "Am primit asta acasă. Citește și trage singur concluziile.", evidence: 'VD-004' },
      { match: ['ajutor', 'locatie', 'locație', 'cauta', 'caută', 'unde'], response: "Dovezile sunt în port. Caută containerul roșu." },
      { match: ['cine esti', 'cine ești', 'numele', 'cum te cheama', 'cum te cheamă'], response: "Numele meu nu contează. Contează doar ce ai găsit tu în dosar." },
    ],
    fallbacks: [
      "Pune întrebările corecte dacă vrei răspunsuri adevărate.",
      "Timpul trece, detectivule. Ce ai de gând să faci?",
      "Nu suntem singuri pe acest canal. Ai grijă ce scrii.",
      "Fiecare cuvânt pe care îl scrii e monitorizat. Fii precis.",
      "Nu am toată noaptea. Spune-mi ceva ce nu știu deja.",
      "Întunericul ascunde mai mult decât crezi. Continuă să cauți.",
    ],
  },
  'elena-varga': {
    keywords: [
      { match: ['victor', 'dragos', 'dragoș', 'suspect'], response: "Victor? E un om periculos... nu mă băga în asta. Am văzut ce face cu cei care vorbesc prea mult." },
      { match: ['corbu', 'mihai', 'intermediar', 'interlop'], response: "Corbu controlează tot ce intră și iese din port. Am auzit că are oameni și la autorități. Fii atent." },
      { match: ['container', 'port'], response: "Am văzut o mașină neagră acolo la ora 2. Doi bărbați au scos ceva greu din container. Unul purta uniformă.", evidence: 'EV-001' },
      { match: ['noaptea', 'noapte', 'vazut', 'văzut', 'martor'], response: "Da, am fost acolo... lucram tura de noapte la bar. Am ieșit la o pauză și am văzut totul. De atunci nu mai dorm bine." },
      { match: ['masina', 'mașină', 'numar', 'număr', 'inmatriculare', 'înmatriculare'], response: "Numărul? Am reținut doar primele litere: CJ-07... restul nu l-am văzut. Era întuneric.", evidence: 'EV-002' },
      { match: ['frica', 'frică', 'speriata', 'speriată', 'amenintare', 'amenințare'], response: "Cineva mi-a lăsat un bilet pe ușă: 'Taci din gură dacă vrei să te mai trezești.' De atunci verific ușa de trei ori." },
      { match: ['ajutor', 'protectie', 'protecție', 'siguranta', 'siguranță'], response: "Ajutor? De la cine? Autoritățile? Corbu are oameni acolo. Nu am încredere în nimeni." },
      { match: ['cine esti', 'cine ești', 'numele', 'cum te cheama', 'cum te cheamă'], response: "Sunt Elena. Lucrez la barul de lângă port. Sau lucram... acum mă ascund." },
    ],
    fallbacks: [
      "Uite, nu vreau probleme... dar nici nu pot să tac. Întreabă-mă ceva concret.",
      "Mă uit mereu peste umăr de când cu noaptea aia. Tu ar trebui să faci la fel.",
      "Nu am încredere nici în tine. Dar n-am de ales — cineva trebuie să afle adevărul.",
      "Vorbesc repede că nu știu cât timp mai am. Ce vrei să știi?",
      "Dacă nu mă crezi, du-te la port și uită-te singur. Dar ai grijă pe cine întâlnești.",
      "Am și eu o viață, detectivule. Fă-mă să simt că merită riscul.",
    ],
  },
  'mihai-corbu': {
    keywords: [
      { match: ['victor', 'dragos', 'dragoș'], response: "Victor? Hah! Ăla e un laș. Se ascunde și trimite alții să-i facă treaba murdară. Nu-l mai căuta." },
      { match: ['elena', 'chelnerita', 'chelneriță', 'bar'], response: "Chelnerița? Aia vorbește prea mult. Dacă e deșteaptă, tace. Dacă nu... nu e problema mea." },
      { match: ['container', 'port'], response: "Nu-ți băga nasul unde nu-ți fierbe oala, băiatule. Portul e locul unde dispar oamenii.", evidence: 'MC-001' },
      { match: ['bani', 'tranzactie', 'tranzacție', 'plata', 'plată'], response: "Bani? Toți vor bani. Dar nu toți au curajul să-i câștige cum trebuie. Tu ai?", evidence: 'MC-002' },
      { match: ['politie', 'poliție', 'politia', 'poliția', 'lege', 'autoritati', 'autorități'], response: "Autoritățile? Jumătate din ei sunt pe statul meu de plată. Cealaltă jumătate e proastă." },
      { match: ['amenintare', 'amenințare', 'pericol', 'risc'], response: "Asta nu e amenințare, e un sfat prietenesc. Oamenii curioși au tendința să dispară pe aici." },
      { match: ['cine esti', 'cine ești', 'numele', 'cum te cheama', 'cum te cheamă'], response: "Mă numesc Corbu. Și dacă ai ajuns la mine, ori ești curajos, ori ești prost. Vom vedea." },
      { match: ['ajutor', 'informatie', 'informație'], response: "Informații? Informațiile costă, prietene. Ce-mi oferi la schimb?" },
    ],
    fallbacks: [
      "Ai 30 de secunde. Vorbește sau pleacă.",
      "Nu mă interesează problemele tale, detectivule. Am pe ale mele.",
      "Fiecare întrebare pe care o pui te costă. Gândește-te bine.",
      "Heh... crezi că poți rezolva ceva vorbind cu mine? Hai, amuzează-mă.",
      "Portul nu doarme niciodată. Și nici eu. Ce vrei?",
      "Încetează cu întrebările vagi. Fii direct sau pleacă.",
    ],
  },
  'elena-varga-j': {
    keywords: [
      { match: ['articol', 'scris', 'publicat', 'ziar', 'draft'], response: "Uite draft-ul articolului meu. Citește-l și spune-mi dacă merită riscul.", evidence: 'EVJ-001' },
      { match: ['fotografi', 'poze', 'imagini', 'minister', 'mta', 'sediu'], response: "Am fotografiile. Le-am făcut personal din parcarea sediului MTA. Privește.", evidence: 'EVJ-002' },
      { match: ['sursa', 'sursă', 'email', 'coordonate'], response: "Am primit un email criptat de la sursa mea. Conține coordonate. Uite-l.", evidence: 'EVJ-003' },
      { match: ['ajutor', 'unde', 'ascuns', 'ascunsa', 'ascunsă', 'arhiva'], response: "Nu pot să-ți spun unde sunt. Dar pot să-ți spun unde să cauți — la arhiva din subsol." },
      { match: ['pericol', 'amenintare', 'amenințare'], response: "Am primit amenințări. De aceea m-am ascuns. Dar adevărul merită riscul." },
      { match: ['cine esti', 'cine ești', 'numele', 'cum te cheama', 'cum te cheamă'], response: "Sunt cea care a scris articolul pe care nimeni nu a avut curajul să-l publice." },
    ],
    fallbacks: [
      "Fiecare investigație bună începe cu o întrebare simplă. Care e a ta?",
      "Am văzut lucruri pe care alții preferă să le ignore. Tu ce preferi?",
      "Încrederea se câștigă greu în meseria mea. Demonstrează-mi că meriți.",
      "Tic-tac... deadline-ul se apropie. Ai ceva concret pentru mine?",
      "Jurnalismul de investigații nu e pentru cei slabi de inimă. Continuă.",
      "Scrie-mi când ai ceva solid. Nu am timp de speculații.",
    ],
  },
  'mihail-rusu': {
    keywords: [
      { match: ['nexus', 'corporatie', 'corporație', 'firma', 'firmă', 'cod', 'program'], response: "Am extras un fragment din algoritmul lor. Uite-l. Nu-l trimite nimănui.", evidence: 'MR-001' },
      { match: ['server', 'hack', 'acces', 'backdoor', 'certificat'], response: "Ia certificatul ăsta. Ai 48 de ore până expiră. Portul 4443.", evidence: 'MR-002' },
      { match: ['supravegh', 'monitorizat', 'urmarit', 'urmărit', 'log', 'cetateni', 'cetățeni'], response: "Uite log-ul de supraveghere. 14.000 de oameni. Fără mandat. Totul aici.", evidence: 'MR-003' },
      { match: ['ajutor', 'unde', 'cauta', 'caută'], response: "Backdoor-ul e încă activ. Portul 4443. Dar ai nevoie de certificatul meu ca să intri." },
      { match: ['criptat', 'mesaj', 'indiciu'], response: "0x4E 0x45 0x58... restul îl afli când ajungi la terminal. Nu online." },
      { match: ['cine esti', 'cine ești', 'numele', 'cum te cheama', 'cum te cheamă'], response: "Un fost angajat care știe prea multe. Atât trebuie să știi deocamdată." },
    ],
    fallbacks: [
      "Buffer overflow în conversație. Fii mai specific.",
      "Conexiunea e instabilă. Sau poate cineva o face instabilă intenționat.",
      "Am 3 minute pe canalul ăsta. Folosește-le bine.",
      "ERROR 403: Informația asta e clasificată. Încearcă altceva.",
      "Procesul rulează în background. Dă-mi ceva cu care să lucrez.",
      "Ping... pong... ești încă acolo? Timpul expiră.",
    ],
  },

  'mihai-costin': {
    keywords: [
      { match: ['andrei', 'serban', 'șerban', 'pilot', 'prieten'], response: "Andrei... era ca un frate pentru mine. Ne-am cunoscut în clasa întâi. Treizeci de ani de prietenie. Și acum... *pauză lungă* ...nu mai e.", evidence: 'ZB-001' },
      { match: ['telefon', 'sunat', 'apel', 'ultima data', 'ultima dată', 'vorbit'], response: "Da, Andrei m-a sunat înainte de zbor. Era speriat. Mi-a zis: 'Mihai, dacă mi se întâmplă ceva, telefonul meu e tot ce contează.' Nu-i știu PIN-ul exact, dar știu că era obsedat de un an anume...", evidence: 'ZB-001' },
      { match: ['cod', 'pin', 'parola', 'parolă', 'blocat', 'deblocare'], response: "Codul lui Andrei era anul medaliei lui de onoare plus numărul locului din avion. Medalia aia de la campionatul de aviație... o purta mereu în portofel. Zicea că la anul ăla trebuie să adaugi numărul locului ca să nu uite niciodată codul.", evidence: 'ZB-008' },
      { match: ['medalie', 'onoare', 'portofel', 'campionat', 'aviatie', 'aviație'], response: "Medalia? Da, o purta mereu cu el. Era de la un campionat de aviație din tinerețe. O vezi în dosarul de probe — cred că au fotografiat-o când i-au confiscat lucrurile.", evidence: 'ZB-008' },
      { match: ['loc', 'scaun', 'seat', 'bilet', 'imbarcare', 'îmbarcare'], response: "Biletul de îmbarcare? Ar trebui să fie în probe. Verifică ce loc avea — era important pentru el, zicea că e 'numărul lui norocos'. Combină-l cu anul de pe medalie.", evidence: 'ZB-006' },
      { match: ['zbor', 'avion', 'prabusit', 'prăbușit'], response: "Când am auzit la știri... am crezut că e o greșeală. Andrei era cel mai bun pilot pe care-l cunosc. Ceva nu e în regulă cu accidentul ăsta." },
      { match: ['elena', 'stewardesa', 'stewardesă', 'varga'], response: "Elena? Știu că era stewardesă pe zbor. Andrei mi-a spus că ea a încercat să-l avertizeze despre ceva... Verifică telefonul lui, poate găsești un mesaj de la ea." },
      { match: ['cala', 'cală', 'marfa', 'marfă', 'container', '7b'], response: "Andrei mi-a zis ceva despre un container suspect în cală. 7B parcă. A zis că greutatea nu corespunde cu manifestul. Era îngrijorat." },
      { match: ['0742', 'numar', 'număr', 'apel ratat', 'necunoscut'], response: "Numărul ăla cu 0742? Hmm... nu-l recunosc. Dar Andrei mi-a zis odată că primea apeluri ciudate de la cineva legat de inspectorul de la USZ, Dragoș. Ăla e un tip periculos." },
      { match: ['note', 'notite', 'notițe', 'scris'], response: "Andrei avea obiceiul să noteze tot pe telefon. Dacă poți debloca telefonul, vei găsi tot acolo. Notiță, mesaje, tot. Cred că avea și o notă protejată... cu un nume drag lui." },
      { match: ['zb-011', 'nota criptata', 'notă criptată', 'nota lui andrei', 'mara23', 'cifrele nu se potrivesc', 'semnat actele', 'semneze', 'ai semnat', 'de ce ai semnat', 'nota decriptata', 'notă decriptată'], response: "*tăcere lungă* ...Ai găsit nota. Știam că o va lăsa undeva. *voce tremurândă* Da. Am semnat actele fără să verific. Andrei m-a întrebat de greutate și eu i-am spus că totul e în regulă. DAR NU ȘTIAM CE ERA ÎNĂUNTRU! ...Victor Dragoș m-a amenințat. Mi-a zis că dacă nu semnez, cariera lui Andrei se termină. Că va fi radiat din aviație. Am vrut să-l protejez pe Andrei... și l-am trimis la moarte.", evidence: 'ZB-011', confession: true },
      { match: ['confesiune', 'adevarul', 'adevărul', 'recunoaste', 'recunoaște', 'cine te-a pus', 'cine a ordonat', 'cine te-a fortat', 'cine te-a forțat', 'dragoș', 'dragos', 'victor', 'amenintat', 'amenințat'], response: "Victor Dragoș. EL m-a pus să semnez. M-a chemat într-o seară și mi-a arătat dosarul lui Andrei. Mi-a zis: 'Semnezi sau prietenul tău nu mai zboară niciodată.' Am crezut că e vorba doar de niște acte... nu de un container cu 200 de kile în plus. *plânge* Andrei, iartă-mă...", confession: true },
    ],
    fallbacks: [
      "Andrei merita mai mult decât o investigație de fațadă. Ajută-mă să aflu adevărul.",
      "Îmi e greu să vorbesc despre el la trecut... dar trebuie.",
      "Dacă pot face ceva — orice — ca să aflu ce s-a întâmplat, sunt aici.",
      "Andrei mi-ar fi spus mie dacă era ceva ilegal. Eram ca frații.",
      "Treizeci de ani de prietenie. Treizeci de ani. Și s-a terminat într-o secundă.",
      "Telefonul lui Andrei... acolo e cheia. Sunt sigur. Dar ai nevoie de cod — caută medalia și biletul.",
    ],
  },

  'elena-stewardesa': {
    keywords: [
      { match: ['zbor', 'avion', 'xr-4057', '4057'], response: "Zborul ăla... am încercat să-l opresc. Am trimis mesaj lui Andrei. Nu a ascultat. Sau poate nu a apucat..." },
      { match: ['container', 'cala', 'cală', 'marfa', 'marfă', '7b'], response: "Am văzut cum au încărcat containerul 7B. Era MULT mai greu decât ce era pe manifest. Doi bărbați în uniformă l-au adus pe o platformă separată. Nu era procedură normală.", evidence: 'ZB-002' },
      { match: ['mesaj', 'sms', 'avertizat', 'trimis'], response: "Da, i-am trimis SMS lui Andrei. Am scris că am aranjat totul pentru decolare. Dar era prea târziu..." },
      { match: ['pilot', 'andrei', 'serban', 'șerban', 'victima'], response: "Andrei Șerban... era un om bun. Nu merita ce i s-a întâmplat. Cineva l-a trimis la moarte cu bună știință.", evidence: 'ZB-001' },
      { match: ['cine te-a platit', 'cine te-a plătit', 'bani', 'platit', 'plătit', 'mituit', 'ordin', 'plata', 'plată'], response: "Bani?! Tu crezi că am făcut asta pentru bani?! ...dar dacă vrei să știi cine PLĂTEȘTE, întreabă-l pe inspectorul de la USZ, Dragoș. Victor Dragoș. El a semnat verificarea containerului. EL a aprobat totul.", unlock: 'victor-dragos-pilot' },
      { match: ['dragos', 'dragoș', 'inspector'], response: "Victor Dragoș... inspectorul de la USZ. A fost suspendat anul trecut, dar tot are conexiuni. A semnat personal verificarea pentru containerul 7B. Ceva e putred." },
      { match: ['costin', 'mihai', 'prieten'], response: "Mihai? Îl cunosc. Era prietenul lui Andrei. Un om bun. Cred că el e singurul care chiar vrea adevărul." },
      { match: ['frica', 'frică', 'pericol', 'amenintare', 'amenințare'], response: "Sunt terifiată. De când am vorbit la anchetă, primesc apeluri anonime. Cineva nu vrea să vorbesc." },
    ],
    fallbacks: [
      "Nu am încredere în nimeni... dar trebuie să vorbesc. Altfel mor cu secretul ăsta.",
      "Fiecare noapte visez avionul. Și fețele pasagerilor.",
      "Întreabă-mă ce vrei. Dar fă repede — nu știu cât mai pot vorbi nestingherită.",
      "Dacă ai ajuns la mine, înseamnă că ai citit mesajul. Bine. Continuă să sapi.",
      "Nimeni nu mă crede. Poate tu o să mă crezi.",
      "Am văzut totul. Am văzut cum s-a încărcat cala. Și știu cine a aprobat.",
    ],
  },

  'victor-dragos-pilot': {
    keywords: [
      { match: ['container', 'cala', 'cală', 'marfa', 'marfă', '7b'], response: "Containerul 7B? Am semnat verificarea, da. Dar nu știam ce era înăuntru. Mi s-a spus că e echipament medical. AM FOST MINȚIT!", evidence: 'ZB-005' },
      { match: ['elena', 'stewardesa', 'stewardesă', 'varga', 'platit', 'plătit'], response: "Elena e o mincioasă! Ea a fost cea care a facilitat accesul la cală pentru oamenii ăia! Nu eu! Verifică camerele de supraveghere!", evidence: 'ZB-009' },
      { match: ['semnat', 'verificare', 'aprobat', 'inspectie', 'inspecție'], response: "Am semnat documentul, recunosc. Dar am fost presat. Mi s-a spus că dacă nu semnez, familia mea... *tăcere* ...nu pot continua." },
      { match: ['pilot', 'andrei', 'serban', 'șerban', 'victima'], response: "Șerban știa prea multe. De asta a murit. Nu a fost un accident — a fost o execuție mascată.", evidence: 'ZB-001' },
      { match: ['zbor', 'avion', 'prabusit', 'prăbușit', 'accident'], response: "Nu a fost un accident. Motoarele au fost sabotate. Cineva a vrut ca avionul ăla să nu ajungă la destinație. Și eu știu cine." },
      { match: ['cine', 'responsabil', 'vinovat', 'ordin', 'cineva de sus', 'superiori', 'sef', 'șef'], response: "Cineva de sus. Foarte sus. Nu-ți pot spune numele, că mâine mă găsesc într-un șanț. Dar uite ce-ți zic: containerul 7B nu era singurul. Sunt zeci. Și totul vine de la un singur birou — un birou pe care nimeni nu are curajul să-l deschidă.", cliffhanger: true },
      { match: ['bani', 'corupt', 'coruptie', 'corupție', 'mituit'], response: "Toți suntem corupți în sistemul ăsta. Dar unii sunt mai corupți decât alții. Eu am semnat o hârtie. Alții au semnat condamnarea la moarte a 144 de oameni." },
      { match: ['costin', 'mihai', 'prieten'], response: "Costin? E naiv. Crede că prietenul lui era un sfânt. Șerban nu era nevinovat — știa și el despre container." },
      { match: ['cutie neagra', 'cutie neagră', 'cutia neagra', 'cutia neagră', 'inregistrare', 'înregistrare', 'cockpit', 'ultimele secunde', 'recorder'], response: "Cutia neagră? Am o copie. Nu mă întreba cum am obținut-o. Ultimele 47 de secunde... vei auzi o voce pe care o cunoști. Și nu e vocea mea.", evidence: 'ZB-010', cliffhanger: true },
      { match: ['adevar', 'adevăr', 'totul', 'spune tot', 'marturisire', 'mărturisire', 'confesiune'], response: "Vrei adevărul? Bine. Am o înregistrare din cockpit. Ultimele secunde ale zborului. Ascult-o și apoi spune-mi cine e criminalul adevărat.", evidence: 'ZB-010', cliffhanger: true },
    ],
    fallbacks: [
      "Ai ajuns la mine. Felicitări. Dar nu te bucura prea tare — adevărul e mai urât decât crezi.",
      "Fiecare informație are un preț. Ce-mi oferi în schimb?",
      "Nu sunt omul rău aici. Sunt doar un pion. Caută regele.",
      "Dacă mă arunci în închisoare, adevărul moare cu mine. Gândește-te bine.",
      "Am familie. Am copii. Crezi că am ales să fiu în situația asta?",
      "Întrebarea nu e ce am făcut eu. Întrebarea e: cine a dat ordinul?",
    ],
  },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function findKeywordMatch(suspectId, userMessage) {
  const config = SUSPECT_RESPONSES[suspectId];
  if (!config) return null;

  const lowerMsg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const originalLower = userMessage.toLowerCase();

  for (const rule of config.keywords) {
    for (const keyword of rule.match) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lowerMsg.includes(normalizedKeyword) || originalLower.includes(keyword)) {
        return rule;
      }
    }
  }

  return null;
}

function getEvidenceById(episodeId, evidenceId) {
  const episodeEvidence = evidenceData[episodeId];
  if (!episodeEvidence) return null;
  return episodeEvidence.find(e => e.id === evidenceId) || null;
}

function getLocalResponse(episodeId, suspectId, userMessage) {
  const matchedRule = findKeywordMatch(suspectId, userMessage);

  if (matchedRule) {
    let text = matchedRule.response;
    let evidence = null;

    if (matchedRule.evidence) {
      evidence = getEvidenceById(episodeId, matchedRule.evidence);
    }

    return { text, evidence, cliffhanger: !!matchedRule.cliffhanger, confession: !!matchedRule.confession };
  }

  const config = SUSPECT_RESPONSES[suspectId];
  const fallbackText = config
    ? pickRandom(config.fallbacks)
    : "... [canal necunoscut] ... Acest suspect nu este disponibil momentan.";

  return { text: fallbackText, evidence: null, cliffhanger: false };
}

export async function getAIResponse(episodeId, suspectId, chatHistory) {
  const lastMessage = chatHistory[chatHistory.length - 1];
  const userText = lastMessage?.sender === 'user' ? lastMessage.text : '';

  await new Promise(resolve => setTimeout(resolve, TYPING_DELAY));

  return getLocalResponse(episodeId, suspectId, userText);
}
