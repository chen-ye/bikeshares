/* global L */
/* global d3 */
/* global firebase */
/* global $ */
/* global async */

// Initialize Leaflet + Mapzen
const mapzenKey = 'mapzen-XFooB4h';
// L.Mapzen.apiKey = 'mapzen-i83ssVS';
L.mapbox.accessToken = 'pk.eyJ1IjoiYmxhc3Rlcm50IiwiYSI6ImlwalZmdUkifQ.TJCtxxyNmRhvH-17afmGng';
//var map = L.Mapzen.map('map');

const map = L.mapbox.map('map').addLayer(L.mapbox.styleLayer("mapbox://styles/blasternt/cja1nhmg1akmg2rnvadioj22c"));

// const networkId = "hubway";
const networkId = "divvy";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAbu-hEkqh2PyaK1c078EUF-cuQ5VwBPnQ",
  authDomain: "bikeshares-37de2.firebaseapp.com",
  databaseURL: "https://bikeshares-37de2.firebaseio.com",
  projectId: "bikeshares-37de2",
  storageBucket: "bikeshares-37de2.appspot.com",
  messagingSenderId: "538370144257"
};
firebase.initializeApp(config);
const db = firebase.firestore();

const hubwayStationMap = {"3":"c039b478f4cd30b69758596ddcfd5cf5","4":"923c9498bf653bce81b9f5bf06f9c499","5":"0ebfbd58421465842f99d4e20c0188a8","6":"3e84baca09333cd2d2bce4f9234ea380","7":"94e2b48b7d791cb4edceb257f77d0553","8":"1c69a2302d6c2221cd6057a3f97fc548","9":"8cd611d2cc9bd7b7440c4723ce1d3eb6","10":"a5edb12b9f8d171ae1165a9a2ae1f644","11":"eb276799b6ebc22ee82f33566eb778b7","12":"2b46609efdfe9b6d300bad1e817e1efd","14":"d0ff6538806a4e5c46aa7e95f3fa47ce","15":"ea09e29b591e36435fb8b78918651709","16":"3c1cde4f3197b2599cc6140dc1ea4a80","17":"904b7113d7e610919a5336c1167674e2","19":"97a624904d68d950bc3c5016b4d4b28e","20":"9c85a06bb914c9897dda64fc412498c4","21":"c1ae903b130ca84ef5cb84caa16234db","22":"68dd25824f76cc3063f5120e674bfed9","23":"fe8d0aa13fd9937b7d09e4e26d5f0a8d","24":"5bf7e1226592f7ed603ce0690fa6a566","25":"a45aabe9b54b087818818dc78372bc43","26":"e56b6d877c8dfe81cafd06ca3a7eff71","27":"045fd5ea449046d51d40934e65b46bb5","29":"9153d52f686a63bde64a0bd74574e4e2","30":"96a2904d35d1297555d1d66c435ab29a","31":"a19e611442a8933b8f82774ce3966ace","32":"7d2aefcd5d8b2583ca9814b4fe51928b","33":"da1dc98bb8c74306eca078f7dac261a7","35":"fde40e6fbdcdcff8f513f82fbcadec3e","36":"a7216c0e6bf1375d25b6f104a714d44c","37":"fa4feed48aece06cb19271e25dd799f3","39":"05f50b281104f880804e0111662fecf8","40":"d27a92570184af7220c3130dace0e347","41":"43b6ca106693a73e04b23890e713ea24","42":"de54898148c9f009cd25a7a3ae4219b6","43":"2cce02b482530e0086ad9f529fe48c2b","44":"60ef31e770a3ea5dd7f350fc8877b5d3","46":"95fed99e3a4c8fd726a808cfe4bb2587","47":"4bf16679e6286a5cb72c1ae4526a3107","48":"feec0fa4c8ef432dd873e53115aaa7e9","49":"1714951f74f4b116e42fc312dffa3be9","51":"9f87f7c7336c31701521ddc50d39be0a","54":"0670eb9d5937bfea133bd73ff534c764","56":"ecd52be381f64f509517b6a0e4d7f6e7","57":"24a3f0ab2a83ab70ebe4bf0110cc890f","58":"56d2eb86c21c57692225ee5f13e31818","59":"2e4406867a3574184b0d6be7ede11d38","60":"9604a32e1c960659f85f1e22f44ce8a0","63":"f835af662d1afc1ee1ae8ccfbab70aee","65":"fbe59f14d93321aa504adc16f1081148","66":"338bbc5f3f1adf47da56ad7518bbb48e","67":"c91bc9b7e63c282da005f7eac27f8d96","68":"575e04966344a392bbbf9eccf09f029d","69":"f5cd79c9dd25baf7099ff87f1837686a","70":"6eeb219ec20094deafc039019160b33f","71":"6dbd6e946d3f4a22eda526eae1877257","72":"d8071846cc7cb01f669554ddebf02b65","73":"4f0217ba3cf7bea5a7e4d07e58ec259b","74":"559f6c10954fbe02c18f04cc0c2f7ddd","75":"295b9c9707dfc5ad38f5a26740a06b48","76":"39595521b8d76cff6372dc8355b1190c","77":"fc9d0d6dab0b0ccbb300289b4b2e92df","78":"669dfa375fcd4c6eead89ea6b89f6199","79":"0559164ae244ded879b0a74d8c122a77","80":"d14fddb02c64c81c4c9febd44968d294","81":"a35b80134814b7fd4592404b8ddb2a24","82":"5bcb4f7aa8bd4230cea068527529fd99","84":"34c6c5aae93dc743e4ef6dd633ee02bc","85":"6914c1962c64ca2a1c5f7bba047d9788","87":"e7bf3cb1dd05da389680f35f83927905","88":"0e48c04cc3047674d07fd003b5135dfe","89":"d0d13765d45b5bdf356acd9b859b7b99","90":"75568350ac15d1840f7f00b79913b6ee","91":"fce261dec8cf0d2593b65a7e8f726597","92":"db674ff3758d0911cdadd98f6f39f1a0","93":"9f6fae7b1b3a673377b452474ca2bcf1","94":"1e356b3d262d3819ace481af4e2d4135","95":"582f82ed392b7b5c072a7bbe40a40dfb","96":"8386693bdc273780efffd5d5eb9aed7c","97":"b01bba5bea3e1f63d6319d1f18a21271","98":"a0fa77069d080a45d5e9290af54e9f46","99":"600ca9bf59409d83f15862a1c0dfe4b0","100":"8826fb6a8e69e2fd45f22d8ee1c1a8de","102":"ad43939d620ef225d35eafdb9ef9a29d","103":"2b13bff9013c2beaf86e5f4544274345","104":"ad81792b682543ed97bf3188819c0b81","105":"94ce3435b4ade8bcc9585e0887771ef5","107":"d5d8f74a35cbfb15b544ff984c9f2307","108":"066efb58cb770f3d708a4f83a11fb374","109":"9e6a8c665def7b9475f618f73bf16e2e","110":"c3a13f2adb7762587acf15eec38bd91f","111":"f011b03ae269733cd81eb2058feeafe6","112":"3f002b9808de30c28132f3cde02667be","114":"6f7189e1db7479b6f143e990b6a2f79d","115":"272d2ed6d42ae8921f98b33d030519b6","116":"119f3ccd51ee15db7ff6f41bd497c601","117":"59599891ac2365b5fa23d5f61ecf17c4","118":"6cf4bfc8093794c40451d865b74e695e","119":"8414286d3232109891e1a2dfe396a59e","121":"0085d07859b67a2f60c8e7dad5f70f1a","124":"de412fd4ed57348bf9ec6bd7339b04f6","125":"f98ba2c9b1fb1563296760c08521dfcb","126":"f5577b56bb543db5cb15ae25621fe732","130":"709c9f1c1c7910bf3b94968d85630562","131":"24e99d91d84351d3e224e3d7ef2c7799","133":"68fc84a359655b54175ddc443e79003b","135":"997d209a53d13471372a1145c32d663a","136":"b03546e29d60dde109fa231ff93c88b5","137":"51ae4b12dfa3be5bf1cfd5ec621b2c3b","138":"af050e8bab271eeebf49b5407a09d415","139":"3831590999fc4a7f52d08952a6bd045d","140":"73935d28a37369a3e00400aacfb755f7","141":"d797b3a092f9f889b1cf181ec17e1ae2","142":"2b4e2a73580c8b3d22be6ea6480f0f30","143":"e05d253ccb22c56ee8624c467c8d81f6","145":"c199d7ad26651f605e7bb8778852a5e4","146":"0b0ef90ed68e023d65ed3b1c57eb6d36","149":"ded434853a62ec9703f2484cca685c20","150":"77b48a5112ce801c139722ae4d0edad7","151":"0f6de24ee3d6995945a685ecb9fe5771","152":"0d0f6b413915f118e0c8c7e0ea107ffa","157":"3eda44ce546b2d45a468cf7e2d0300a1","159":"a9af3ba18dec64bdfb9c2b644956243f","160":"3dc7433790fc03a6749498c3208a4e96","161":"be6410ffefa71e9a6282fa1fdef1bf72","162":"fa1b93d10ff350bd1e7469a1db231aa1","163":"f0683fe3086af95afeae07cc0357fd52","169":"f10d6a600af972c6b5d7953c49d5c654","170":"3d5ed4d9f089974d5d0f0fc19ad17d9c","171":"feba1b6e8c43b983bf48479cbacec840","173":"52f7c777f0850cb03ceb546289c74649","174":"66d0f515f619b404c689211df256024f","175":"b0f4189efee3fe8e880bfffcabfff93c","176":"352815b0fd48c554845e499609a51347","177":"2073f8fbb163ff4e693cfad00f0dd64f","178":"0e29fe31b281f3b6ca6f7c06c8eb7aa4","179":"943a5046e94d9462496182d9e38da371","180":"8482b3ad353c1e6e9e317296f41eb064","181":"1eeeb634d10232efadcbb8396fee8b88","182":"bf75e5d4343945db9675efcc60d1bf12","183":"246f58e0ae4db954e8dae72d11e19a81","184":"1f822fdb6173d31544d095e4fd981415","185":"bbdda846f9d9d1b155d4a3614ed7ecfe","186":"036ab7e3f20a35bce54f4497aa2470b9","189":"69c98e683921460eecdb85a49a0f7b77","190":"2601ac8e4decf87d75d824fa7e47b9a5","192":"4d51f6d4dc4b79326311d888ba73a86d","193":"171d66dfe7c34a2348eb9514d653fb1a","194":"7834292992b37578067b345232346bad","195":"7bd2d765ef465e66ae4ad4623daf4917","196":"ea3c9ae5995449b37ad7db1727bd6dee","197":"3ef6b015b6284b4731db6b9e02a3d1cb","200":"294242dbc29d86a80477f22608479bc8","201":"e1eb05d342c7993b9628a687211b04ea","202":"bb5087ad1912ee66a53a0245ce50eef4","203":"c2561905a4f6fad8c8bee1043bde9a6c","205":"aa2cadce93985cabcc8c1701a5c8be20","207":"3f57cfe0f525ea8ba9c2d07a1ce63a06","208":"9780cd14bba5099819fcd16c8bd8d897","209":"bbabf30a0df284668fd7594ab1218a56","210":"7944872d3021ca28cdaca8c32f9d0c7f","211":"66576a901b33431b167da0141c293dc5","212":"93542dcbf21f5411569adb92cd7cc199","213":"d9c7ef5dbda4ed944d1bf51fe540acb6","214":"63980598720f0bf1e318817f1be29afb","215":"8ece5437df6558cd259deb3b2af0e25e","217":"553ed0300d38108b4f21a6bafa3db70c","218":"2893854c4c64eb00b7cbac5381c3e6c5","219":"2743ef861ea179516fce8114a16965ec","221":"8d970bd1cdb480aeebc10da260449e02","222":"f0fc21e8403480413d2d2ac1d601d493","224":"c55f98cd397c770914c28a590e3ab90a","225":"1b7f50a75403e1f818b0b1dd81c09e9f","226":"e00981ae2721bdc7339d4ee00759f650","228":"eb7a7c91c78b8fb7982c1310d52be566"};
const divvyStationMap = {2:'37fb4e39ba5e68fb79ee1ec612162d10',3:'e82fa43aef1ea69e1d0e6ba769e089c7',4:'9d0eb340d15e3f593d7898a5d6a714c6',5:'372e1aac0ec91b1a32e7725ecf385645',6:'c42e837da29896d7d61c334adfc2c0c8',7:'ece087e696e275399cedbaa0c6b355b6',9:'530ec57ae6a997084295a469e42e73f7',11:'90d1c94f86829864fe4e6c577dd50ad5',12:'bd04e2b3d04c43004098924b479f0816',13:'7d43da0db1d8358218e32b86a3816a43',14:'c084f0bc5eb8211e19ebbe383c0b34e7',15:'947b15686b78bd648a6ffe2b6cf139f5',16:'31b45ac5724ad2c71b96043c719be460',17:'0b84766adf0a2f3f800d4f98ee68c532',18:'9cef10c94a37fb6ea5c9f9e0bc84efb7',19:'ad25a36e1cf6b908e656f32b4cafdc11',20:'b9114301c8c90734fb1516d19fe37e4c',21:'8a65f2a456027d20ac7cc0ba1cbbc7c5',22:'9cbb73fec398309a781cd3223fece425',23:'a0fd691b483dda622169d07dd9d3797b',24:'ddc42415ecb2a045ea43f2bae952f6fc',25:'d89414e6edca9ab125a8d97a4c0514e8',26:'5f0d78da71a52f0de7033f78648bfd34',27:'5f100ae1d10485a50b289d60c3aa31a1',28:'f8398d403e707d33e981655a09aec96f',29:'f3f991ce6c3f46e48a038ac92825e066',30:'401df72cdbd168f03fc35f2f805a5d95',31:'5c519800ea4995d302dbb20a217bd8f7',32:'c2340f845a4549b2209839b8cc129b36',33:'b9e744947abe019aedac202b985f667e',34:'d12243325355e6705dd9a23d75b3a268',35:'f5e39d9ea81017d4f7a148c6b83d0d10',36:'1c7ea9d866619c3ca0db16462a0f1465',37:'aa46fd3f3a431b5860dbf50cfc340aac',38:'d09e04b78027394bf3a361c0ce451563',39:'47d3b52cf66e0be2e18d6420e758c701',40:'ae17da9ffdb20ad027b9b4b7b6580c84',41:'b7df03953190c3f975e669e6766ca395',42:'8875547144c92a1028f7f675099dd3ab',43:'ba6e21185e51d99bdfa246a5c8f5eb90',44:'455c72dcbc405ff7045de8b83db5e236',45:'2ae97b50ac16947923f4b345a362f03a',46:'1cbcc72e1880040a9410290366815cca',47:'13bc262c61ca5f719501719d16bf6859',48:'91eebabdcecb4c750524aa7ca9962337',49:'12b8254ec71dca55a171f0d2207cd7db',50:'6897aa465f79389fcf214e695719b2fa',51:'8aff3906ed0318fc7bb7d88623acdfd0',52:'633e23d2b83effb8b1f310fc67f2dcc6',53:'9f2cd41ff12c6a206ca0a72764c1c4f8',54:'a6b98b17ed8f680c669197abdd66fc17',55:'37c0a71c55f34d49365e0d7c048d200c',56:'dbe3f5a9188f9c7887d3ced1e5a970fb',57:'ca9fe1ad6bf9de7d4c70eb32585acb13',58:'0da615a46bee68ae05295f9f1ea6c097',59:'2cd73a021587f99df63d6bae8f02f239',60:'61e0da2f7ddcc37a0d71293132cd41af',61:'5e8af6ab3c5f6cb8384b13738c13d290',62:'1419b1b194846c781d1d3772a532eab8',66:'907f9c85ec9d32a227f93c076a2183d8',67:'1c529368db02e34af3414e7e5701f9e8',68:'364d58ee59313cba92553197557683b1',69:'d2a8063bbbc50c28075b33635759647c',71:'014a42e3d7ead8828264806a8a74cecc',72:'26e9f5274b8a1765f183206856aa7f44',73:'d30e9313b47b0633f317257791b12467',74:'8fe6d9fbcda5be6716c48062c1d88607',75:'eda649a23d4085da497fe9116739bc40',76:'ca251db283cd0f46ffe302b9a2ffc2f4',77:'2729a820288c55ce3d4186505ae187af',80:'e82f46981e6c2866cb92a47f8a05424b',81:'07a05a5b2cbad4d92ae629957447b393',84:'9aaf7b250c54a478899273e791d42d9b',85:'1782dc75c6a04f132980f31c7df72a38',86:'022c620271c4c057eb1caeb116c089e3',87:'b2a36d2a06522501fc987923fdd29d2e',88:'0515f954bb899b64835a0cc692d6366d',89:'b142d4f5f8bc7a444a9c1f32d86cd02b',90:'96561e2c766a72c90d22128feca8664a',91:'840e7d9500f75713a2f0acc89c819750',92:'c6454aa37f7430526c2fc669fddb9e87',93:'bc4590517325920d25c6f7db1cbd5c9c',94:'751236b7bb53e5ec76263823dde59097',95:'282549ecf383bd8453b6f358b6782ed8',96:'9a37dbc5c45d1b66efb017c03317059d',97:'1bda95324fef73c6f1a71f1f40aebb45',98:'d26cdaf63686931632d8f3317d720f8f',99:'8ca70d632b293f69087124500bdfb177',100:'b054c6e1fba2ba16c524f975d4d67f01',101:'5a7f307defae0bbc4e143eb09f5458e6',102:'198e6b78d2797c8caad5b16e6fc36a15',103:'ee6928bd2a7172a0189305ebc12505c3',106:'ec839fe097cc94a666c09075e3cdd265',107:'9f962036e2bc22a663552c688f474ba5',108:'6458e7def29be0a0a488a7e046ac127c',109:'6b7af736e6add0e077c2be2e281a2592',110:'7beddb67c3011a9cb627f1c9a097d98b',111:'b34d06e44c1e146a0bb5cf1bc37de2b0',112:'99b99f0bcce178641b81e8fd14b73f09',113:'70c7953aa5d3709c96962c88dbfa6f76',114:'366c20ad7571dc525964d6ae9ddbd05b',115:'3a1fd069a9b3df38bea9cf177141eab2',116:'9a51030552b35d8530f77718210bc0d4',117:'4810c6bb50e1a0527f0f8351a9d99594',118:'cb11657c8a4f1883485ca94ddd62f73d',119:'b23959be80d47cf5054b64606fbab6d9',120:'ad99a2b7bb13ded2b916df2b89aea13d',121:'4bf1961bbc5ce62b7c2ed40082e9ee27',122:'65c11a745158982e919ddd39261fa212',123:'aea7a01b63eab96f8a8249abea8afab7',124:'1afc3bc0bb3ce82c6418a5276e39f01d',125:'0c3101d9f943db24420dba17aaf63391',126:'cc08d787655803a65c1ddb49bb271e25',127:'37833386facb54ffa8b7a255d5483d9b',128:'64540050be6028b39a22740823a44096',129:'0f177d3b32e60209da05905560c94dde',130:'9c53d84d36c07c7bff64915932424c24',131:'9c13b30b87c08dd313b0bf52f1cacb34',132:'3f8821845df737a4e89cb7b67b2ed780',133:'e3bef3f35cea8ab85cebe484af5e31a0',134:'fd47330e909ed765ab4fe1560cf0d9c8',135:'523cdb0c05211e6622bde2e05bc5e8d1',136:'1ea09bb95a1bd8ebdc7d7148a7a0fc81',137:'71a4f25915a305d580d0120ebadff605',138:'ae489d7ecd6074067b6bd326e7b26ce7',140:'5529080388dcfda7ec6106631ddddccf',141:'d3324ee7cf49c6ee2b902483c5ab9f41',142:'975307690597ba4c521d90067b25ed25',143:'5b2106a3a64c92dcd195195843ea3d09',144:'1e2ac62a7914651c3919c7442c90bb79',145:'beca60f2189a11d22eec7d97fe996db6',146:'7616277d5bfde3ceaa2ac44f48b32318',147:'f21094a0cbb31eeab757f4842a949183',148:'31d68af706c9ec1afaad3d1f43d15c73',149:'00929ee6a896cd369421a485261d98f7',150:'4b352d2d473b6f431f8e950081c751af',152:'5aec39ae0888481cfc712e9eb5b83d2e',153:'d1cdb5b5cb7d6004dfc3c5618dd63774',154:'61229b16fbd62d86a6183a72c89d6390',156:'8ef7087960d1ab3bbd3f54ff02e20900',157:'a27a61ce52acb9af37c8fb0eb26f4486',158:'0880aca32d6fdffe9e6010f1db79b6b8',159:'fb4fd2aaddba07444cc7b6ccd6ed7460',160:'ff723b7380116e7eff98e2ae163ebfb5',161:'f7cb099bbf0d472405042393f538e9d9',162:'33e60f8081b6f75502709c76797709ef',163:'340aee4802e4c4490cc37273b2950d6a',164:'f89aba5bfb97aa779146a4a86948cbba',165:'64c9262ec070f084503ba3d19667145f',166:'5e85a15e67cee35ca841ddb606e566a8',167:'6234e308c0b300f36c0a9034a0802a0e',168:'b556cd44f9641df86b0c328b67f9a07e',169:'ffff0c7b9c2b0487ecb98a5985815429',170:'749986ab25629fb5e203a9cffb7c19c3',171:'eb6011c268f60cb6a58651900ed513a3',172:'7aa892b0b9601e5a7006c86b5443b012',173:'0904db879ab686d6dde5112d75b23a87',174:'a401b5fb09b692a47f5f37b4abea6a03',175:'b357a936e6944bfe7183bfb3ead537f6',176:'8a1eabf974a6b7f10c0f7a7f163e8dff',177:'4bf1cb33224c2325f441e5851939f452',178:'c0356c36bcec24ea9b450c92f3e93000',179:'276c11cafbc516738794f32dd3ba63c3',180:'ebec0243f52cb883abf6c915567d3e06',181:'5448a2961e615908a5fe6047bca07363',182:'8e8f4cee797eafe9ef21c449909aa24c',183:'bea708ca01b9e2b937450209e6610cfd',184:'b2e629da7de69d435fc2f131b7c948e3',185:'5fd2c149c4fa13f3a52a183f51bd63aa',186:'a45b4812bb6018f9caa886580f8fd48d',188:'21cea48e2bd4eee0f3df805e3a2c5b5f',190:'100a3709c9e441ab29c3a8dc210d59ca',191:'e0f509355452421142c89fc70702aab6',192:'f9fc7dc69c3dea477b9bdee19535f824',193:'c84cde6b81786b38276ea58ee89d9368',194:'c18c4d65dba23fd995291bb1e247a4a9',195:'1976697fc5cdfc3ed05deba9b59c5f3a',196:'fda2895d31f014b24208c2fa946c334c',197:'e8088cdb2526d5bb46e97fcc95554047',198:'bd0d5a11826639de928a442a995a91e6',199:'a338f4ed1812b090b17ff9412df9adcb',200:'caa43edb395873b976d5b588c765a32e',201:'02349a616939fac8f0c8c6407d246b05',202:'c8bbeff763f63339d9f6f0f6035a4a62',203:'db60e1029c28db237ece2147b2b51285',204:'07501be58dc46c1c97fc34e267d589ee',205:'615a2ad04a4d6f0cea5a440aaf094f3c',206:'e39f12d016a9b60d8b6a24b38a328b1d',207:'d98d7958c4aab1ebf98b1afafa51217f',208:'491d6bb753c83fb32e426e87e7fbc74f',209:'407ba2b52bf4d50723e7574e9a699636',210:'914127814e130b4e728cc645009ba705',211:'b561a0899780437e4249bfe54fc2bd7d',212:'fc49ed5b843b695d6d2e8cf7e384ba16',213:'152b9354b0321e744df8b8572e8a1225',214:'3b5894f68274871919cc34794e54c02d',215:'7fc647c996c1e48a3f1e10f92753287d',216:'2f74e5daa1d772e75dd310c95860b067',217:'0c81a5ad8c6b9ed9c03773bba80b14ce',218:'c01c5567dbf65268eaf6bac361f089e6',219:'86502ba68a665ada4937cad2e2a901a1',220:'cb0527c34099ad3ac0ee2db6805c3929',222:'9ac5279efb6bf97836c21ad7ba4e480c',223:'8f2f12a573de1ba03278fbd7333fb6a9',224:'a997f09f8309e6a0a45ea2314413070d',225:'1b2346758d429fa1670e2f9b59e98277',226:'f66c4cae7bd5da01011ca4d0f702cd43',227:'55e7bad63571cafc7593c0bc844e8cae',228:'c0e822441d9b83a95b37a690c9993c2f',229:'9df10eac6538dd4478163b70fd962961',230:'ef6fb7139b4550b40ec529de9beb5073',231:'c893c4f1d52daddf537401f09ed08cde',232:'a27d31f8c3ef95ff0049e8bfab0ee288',233:'37972f0757ab6b7a29a81b00507d5a4e',234:'cea0ed3f527bbdc236d92cfdde8258f1',236:'49e23d297cfbe03f3edfbf2a8ff74995',237:'e4f0a502d8c8e72d591db1199ea5d3a3',238:'d907f71deec95aefcda2f9e8647a0097',239:'903a9c358c751c0bb64a846721901e78',240:'5638331eed58a899a85db4936c4dd530',241:'d7ff47c2535184bd63ea537a209678c2',242:'46fb487aa8b25457f97620b7a350e47f',243:'eb788a2e766d5ae9f61f4f987c6f40db',244:'b43e717154e55eb624cb462f835301df',245:'9f2f7ed8a7173aad891b3804829a6587',246:'84dc9dc1654b144e30eaa65921803ab2',247:'68e1816452edc9da738acdaa63427da4',248:'3ee86a2136b47bc297fd017366cf5d38',249:'ffb325b7c243d0632e325b0394fd57c5',250:'38d4473c18239685a845b74e0bbe25eb',251:'b2be6d54f7fec306fee0de788a3b49c9',252:'000e436b8d7bf9fd184d41b156f948cb',253:'0afcba7f08f63a39fa72a258e90ed786',254:'f31f17b9971c52cb0152f44531d388f1',255:'fee4c5520569fb5d72ca5b077308250c',256:'95baaba1fe7864a0e073d1e468bad020',257:'aa83255a111d5d474fa9b39cb68c1712',258:'6e30093aaae9ce8b15b112013a19f839',259:'5b90cb3192d29e64ae990e8c53e19cc8',260:'fd5c4311bb77f1367251605fb71b336c',261:'d14d9dc0b7e1a6ef176f4ee589a101c5',262:'39e37d732168a50575eb1d62644134bd',263:'02b8e6681e98d5ecbd550932fffe653e',264:'31454057b1196b9e7ff10efc48f9e7c3',265:'ea9304b74cdd98ac4cdb6af5f9f82b82',267:'48bba7ce9e8c9533e72d738aca3901a6',268:'75c9d22113ef305f4835d061a0726da3',270:'f83df5ad9762592fb29c27c14b62ca22',271:'9f666ceb4fdc869c4c22de8f8853b7b8',272:'a00c5b96a8b350f4e7d6592a391f28bb',273:'f6701d04eda705e6982d95f96bc7e9e3',274:'7ee4cb8cac896b5b46fedb0f72b5ee83',275:'d71d45b9ccf989cdc95bea58cc59d770',276:'78ff9e31fe882108031732382b1657d7',277:'2201d49f925d6c7a3353f0bf87df111f',278:'d7d0fb1ecaf7de9f8ba9fa6e401af433',279:'86989cfe33e3e0bc607fedac6f467910',280:'f243d810693e02acd4d9a7357fe0aa4e',281:'682ae6d99e9277d6c1b357590cb76360',282:'aaf2ffcccd8d8daf5ff1b23979942eb8',283:'5cf0690536bd6555b00336ddd06d9cab',284:'2bde07852487100be02f1242dca35060',285:'b089dd1c0e23a6b37875706d77babe4e',286:'fe28052cea58423a07be019c9f289fc3',287:'06dd2b4f6c751516c09ea761de5314ca',288:'595e8635dd8d3b387d78c01178dfc93c',289:'d195b667b6d77b8623cbf2e4e5e1b140',290:'9db2884da36cabac8cd67e9bec1e2266',291:'d849d399f3f5819a139a660f4df2b7f3',292:'ce5c76653e8dc91406270f278700a41e',293:'ac2888f3f50db6703232d44509449a5d',294:'11a832f422b10fe7e4cbc244ba11afb0',295:'01dec6831a34cc21119afedc1a551567',296:'ce64acd799ad160f58714e4d66f93bd3',297:'6b1b862f1b6c969e38091549207f8c04',298:'f6f40b97038229c51dad3a55774f8bbd',299:'e17e3c8d94314130f0df319fd621b49d',300:'6e32c94af42f72bf583246403ecb14c2',301:'2903309f30bc4486eabcf451f5d7da7d',302:'c06f083a7937efe97d0fd098f9ef5a8e',303:'482ba3ab09a8c36665a738bed2a0c329',304:'f986dd569fa9f76b0675a5d86451cc9e',305:'b6c35b270544b32622eb385fdb56ece9',306:'990c07828d764c7ee2419414cb7a980b',307:'99536bb46fc2ec14556afc3c04f5679a',308:'5694ac122463a487c2a550cdaa8563fe',309:'fe57e226656e8287c5b8f9fa4a74c0f6',310:'933cb0a5dea77635dc5833d20e5d9be0',311:'a2f2f836110ef21944a56c6e6c50cd77',312:'782f3ed0bec1992ed895160181747cb8',313:'3eab41029dcc7cfb447f7ccfd8f3d188',314:'79ef975c5171b8c6b47155e575c4085e',315:'999b18f3e2453c88bae479ddafbb40ef',316:'69b1e567601c42f55f7b49a139352939',317:'f9a2151430f8a81ad9cb27c03a990fdd',318:'8c777eca4463fff96fff6f05d7850aa9',319:'682e4cc857da471a316a5012abffa79e',320:'3f9652d65929dabd610e65b390e8bf99',321:'3d0dbd6fb19dac0833e284465398979d',322:'d27d509fd6bfefb67f2c8ae35cf1f81b',323:'d26e2a31325b53f74b527bb16f6bb6c7',324:'5d082bc9bb684296802f7a488a38a7c1',325:'8f5d62f4c88ffb3c21bcf8798cd5c2e7',326:'6579c57f3213e3e0c83fff2ed8fed7d7',327:'1b2a5a044a8d0fa98e4fd85d43209ff7',328:'f7bea207137603323736e1cc05ed816f',329:'000daaa4240d94e5b3900d4d083c8d16',330:'dbfeea317c5549215bfd85cbdc151ab0',331:'924d5cf2fa9d84afddf5e6c60e415bd0',332:'5450517ac94514c8cdb2f6771713109a',333:'d28e761aec3c6f4bacf93d9440e60d80',334:'5db6af350c3398de7f21fb926c1a0cdb',335:'5ac527691dfaa8e196ed72be7e010a46',336:'8e2bdb638a19c6730f3d68080451893a',337:'64249f08371dc6381809b21ef7e219e6',338:'8cdd629738fa06dd5b7ce7eb8368cbdb',339:'7a544dab113da78e735a36c045220dd9',340:'7d847e4d2e95d93d23dfb60e811f3888',341:'3e7f4a1a0a89954ac257e403e6d29263',342:'77fdc1c96ea2b87051aa1d14aa3940a1',343:'7c796d4adb3a7cb7c80818ef8e3706ee',344:'1f5c4bbbdda9c2d08239135f4adde68f',345:'1ad7fb8d86ae4bffa241927486981a37',346:'5722adf4f567f20396ba64db2aa3952b',347:'d510712148d2ace2f7efade8e41b4fa4',348:'2f24b711fc7b9fd909cfcf1e04e25757',349:'4976a6d4f99cb78fd33b89d4954ca3a4',350:'1ab26169d4e7efdd43a6328a422c7f0a',351:'a653d3466e0c6e12db1f58d7eb132237',352:'f4c627215ba7eb3edbefc949603b9a8f',353:'662058c8efb656b0b6d990602c027af9',354:'1a1597b75ce539ca3852e86fa40fa9e4',355:'6a25a9e0f01f1a8225370cfa5a216e89',356:'350d3d3266d2df094051aafe4e48d82b',359:'5e371f178ff09dfe69faebb7a41d31e6',364:'cb24b6045d9b1fd588f77a3aec82259b',365:'e9b24795bc43b4ec89feb9b4f2ca7dbd',366:'81ba5c4538ee43a37a5dc5a290c42a5b',367:'bb916a44f6ed7dabfcd37d0e891e1176',368:'33003a323f2d7c6f95b92851e9d75524',369:'2018d77a4f53eb8aa622437859208a82',370:'000db9b6e3849926d4868caf7096780d',373:'9e1ce54c3512c3488794518f48e7ba07',374:'dab7c45f137bb42d1107b3746187c1b0',375:'11acd6213284c21de84156b6a480ae57',376:'0953e85ff257aacb7e653f8dc0e107be',377:'b2d9ad012de7832b5f88cd7dc2ba7007',378:'2243332775c8e6f6b491d2f19adcbf6b',381:'4c7e305720b64ff3eec92f369b8efece',382:'e5ed81097e251dca0e432e04a9d748cc',383:'fde66f3cda6f295b7dc6607591b61f5c',384:'8d1761d610d05d510039533e5cced694',385:'f70578cb7c29e5d5ac2c0743ff14fa3b',386:'c92a84b3a3c73ca5f1de911ced477f7f',388:'da3a55c49a1bc9e356c79406e05b5dd7',390:'6dc7dd1d6b2f49031c3e89be720f67ce',391:'10e5760e340501b5b5680ca27033ecd9',392:'8ff51aa1ca3c794605f6d5d91fbcc2e7',393:'795cd9ce63f2c5528f135067a0581079',394:'69658ca2beefd5d24e80f994afd5eb17',395:'69daae9e88ce59b7450d278528982407',396:'d4f3e30a996eb55f275f5ab6883e9951',397:'6817405363e6a9583e995535405a0805',398:'e63b4cab609a2ea17aeb66601dc43962',399:'b4618559803dbd5c7702057c69d41a83',400:'00bbbb451f5c60bba234419d295a5d0d',401:'78e14c6bbb4758170a0a52626541920c',402:'776ae16be52cfbb5cb338bed52432fd8',403:'1670df30e8b3917b6f649c78a234442d',405:'ea14da01a09544aa23fffb52a27d000f',406:'4a6d6f8d318b4383392b64b1a4a65afb',407:'20b613cd03866a64444bdda247a77bca',408:'26b1c91821312c628cd563f1e550f4ed',409:'9925eae1261a759448546036984abf97',410:'9a46083ab2c3279208846b6e96d12ef7',411:'1df6235b0ff4f6b001382d5d18d49811',412:'657f9b381d52bd4f82983fc2288ec906',413:'2ad32d67edcc4b9881abf3f603e13239',414:'24584d0f8ede430a7b0ad33526a2b6df',415:'25e977407dffb9610bcd6cb20c6e2464',416:'36687d1a860aaf9e3fc77f7c493828eb',417:'91a2767d4d8381858085b4f13ccf1a80',418:'72a821f75c5a0bac7068547cf16b11c5',419:'e4bf5539a44769d46e8dd90f58c8b8ea',420:'0e668976214dbbb381a47595089a78a3',421:'8b79810ce9ad7a020d960d16cfe07844',422:'36da1de22ea44a5eb3d9e7df3ea1008a',423:'34a65f815b861b25fd58151c7e1804fb',424:'26b13efbee493fddbf8beef95a435017',425:'b94a12b653fd0f51138b8cbc62b7c835',426:'751f890c4c49c8e7bcec7d7316f177ee',427:'04a754373233f99b52f6c3374f152c72',428:'fdb715ac19958dbaf1bb67c5ce66ea26',429:'33f72132670a5dcaf0c9c7a45b157141',430:'1dd6aa4e605c5af07097ca54ec3a6a63',431:'89890ee0f6e2a1f3d56d53d69921566e',432:'62519fc09f861dbef91257f55c24ce1b',433:'bfcb1928473513ae0b8dae15049f42b8',434:'8e8994bbfc5423a06954013433be0a3d',435:'ca31807ac807d130a46b090294ceada9',436:'9af01d0df12b4970acf9bf01f04b50be',437:'ec912a1ac4097c5a3c6faae6e9898742',438:'a9bd502fb5e025b3faa52442eb8e6e33',439:'f815b268a008f6a136472b3b9693b104',440:'abcd2fb218a85c0a1d683bf1b67cc74b',441:'50e96b87cb6b4775bec03efba987700e',442:'a42e6fbd08e6f71848e1edcb86f335e1',443:'281a3caadf4e44f393b4f64b861d1779',444:'97de04b929c07278987386d5bfafd3f7',445:'3e5ec3e1e59f5aa05e9a69590a8da3e7',446:'640ce137384b484c9b16bd1692ea7b19',447:'4a8cb7d7f6fc378b4c52f672782ed876',448:'6348a64eb38a08522f7ce5084014bed0',449:'4dffb0710c525e8654550149a17ae0fa',450:'929e2453229c7cc0c9a26d08567211a5',451:'eaec65f163adf9e1aa9c5142640fac7c',452:'b191c5b5d4328ffa3a62fd4ab3b46624',453:'d89ac87da12cff16bccfb09abbbd3f7f',454:'a70815c6c4c3e5b9e55268555f37502f',455:'1aae1888731b8b5d9d5fe5736a26ed19',456:'1b97945037671aed3236ad6cca108a0a',457:'ba61113dd6c0423172f303a0ae36168d',458:'0829c47e62afbe8d933ad2bb7da3596a',459:'e1505f86cb0e599427447e33c0547bde',460:'ab66f497e9135091b9a1babe569aab21',461:'6d27125735f4f7696a61918bfd37b6af',462:'2a325f0dce0eaddbe7623c3cc94edc49',463:'686c8a2a4b2b4e5af4c9b1f94c7de032',464:'565cee830a9cce40615f9af2ab6c41e7',465:'355fa26149298640b56c108863111a32',466:'6794f67cee27936f98d78cbc19b6545c',467:'b76a1bc6b4c1c555b52ac5adfe9950a6',468:'5cdb7a2b62f405d0012daf5df712184a',469:'79fdc8ca913baafc34154b741920d5e4',470:'e1fd323065b7b71db654d07f44614094',471:'2db6d44ef78f3bf804a0fc5d8aad95fe',472:'73419b8436a50579feeca21ce987c5bc',474:'57655611304cb4a66395859ddb08e38c',475:'65aa0c7f16b5a37b61733d5cc2bb78d7',476:'08000cd20d13070c803da1178c247660',477:'d228c1974e39cd597aaa900c3005ca3a',478:'8a4f746992ac2293b93e393c83bbebc3',479:'98fc69d2a12bca242bbbd2144a70d21a',480:'69d397ee69ada567b075d6a132b8e17f',481:'daf37b0036b43b8f4c56584b0bcdfeb7',482:'c7de2ff2480428adbdf4f075222d8c88',483:'0ec7e9f5ce89ccc8b70446b115c714cf',484:'cffcafad3473a0c6e721f17a7c5ebd5a',485:'b2d1deaacfc27554bd245c70ddfbe996',486:'c3a4d36a18769a677d653ef4089198d8',487:'64cc1de23a95df42d4236c4af93c73b0',488:'47b2d581d999aafba8ee3dc64fddcaa1',489:'2f7f198023e329e768359203035a6e11',490:'63dee8c6b761d724fb232edba88de739',491:'91228ca4b209ef6536ef256840b81bca',492:'0595ddafd79f881370e07bb8b3879760',493:'76a7ef4f1a9685f839c4866c3f214744',494:'50f675367f8c25e97c763c11c59f481e',495:'20e02634b8dab0a0469fc3e95a4c4782',496:'0c0a2481e64f6ffada0d915ce5fea5bf',497:'8331b895b5ffe28350476baa3eb663c0',498:'e0e7431735a58a6ca3e36583832dc343',499:'a4e583cdb00ac1e73312f4e49285cb2e',500:'71c19c56beed5356818ad0d7c9f3860e',501:'b9677ab68c1e214fbb8c335cdd25f421',502:'c459edc99e85e8d9ba10b208c04d57e5',503:'f5996ccefbd816e402a7e39b4801742c',504:'7f7d5bcd101f26a8355dedd055b35334',505:'e03ab50563b9e251e2786bce5f89a49f',506:'66fa616feb85ed24909a5c0f6022fdf2',507:'771b594604332e6816fe2c713999aab7',508:'907b919e1da20ef849b4518c71c316d4',509:'06a6de7f7cffde567ee292ea3534bad7',510:'280d3f433457518f47a6032f21cfc3b9',511:'a30f2d2ae75095b65bf6d2e66f1b84c6',514:'8e006fe3c7aae38d8b911580132d6798',515:'fd73d0206c1622729079dbb05b42a9c5',517:'7301e9ce06ba24cc5141c8b8aa202033',518:'d457a7b9da5c491a96d3fcc322fa764c',519:'420834a97c833637964e85c31a304e07',520:'17c5f5125f31cb03694e34c99dc682d8',522:'482f37a0a0cb2a7bab52424656f57b6a',523:'32428eb7e0e87aa3c93de0897caf5f16',524:'2678099b372c37c7971bd3cf7846cad1',525:'6ad515a6267addaf6b2e2bfc15a390d1',526:'7bcd8202d36436fcf1c23e147d2b52d9',527:'e77794c4f4f086fd0a0c2508463f4d87',528:'ed564a9cb47fafea0437ccf0059c7775',529:'f42984edfc3b8b517f6c635015fca399',530:'4edb7ece2f8a8dbfae084f70402c0b6c',531:'765893957418ab80bae6e269653af1e6',532:'2d640ddf05b121076133a5c9dbf1e5f7',533:'40f7025e20483978bc15495343fdbc11',534:'55df39a4ed4acd35c3fdca4307a8ac53',535:'542081770982a15f2d876b2dc82c0038',536:'4709a27bffa86c2df50a8d4a2f841d81',537:'f000e9a69dcd83c637203aeba82370a9',538:'bc5d804e49bed4385aef307dcc197a54',539:'23ef229e2f33c15003090992ef13f535',540:'0acfdd56c4bc483530ecfebfb6e45784',541:'03d1c15054d93c589812b4a63856f784',542:'9229c29db2e2b29844a0bebeb0a1ac25',543:'0b495a7daab1586558cd6ba66247e443',544:'306ac898533a2d97e27a98ef343ed862',545:'a71023fb5337307034da4c1190ccbbb7',546:'3afb58d4078b6318938531c64c67bd32',547:'c42f99a4a4495ef7bcd53afb50a714e7',548:'d6478db99a9c12a549f355985a299c93',549:'7f81ba9c5c3d9302018bc1780028a564',550:'23d2e03453381dd4b40ed4eebd5015ea',551:'f15d1c7ae869d8461876cc51c033baf8',552:'b804c0dd5e6b58346592212f0f9c5f53',553:'6a513a6fe1fb23f86c5e91ac74197ece',554:'ded4fc46332d538747cba18948ad62fe',555:'5037127308a2d715228935c4684ffe93',556:'714a7548f77519de2a10ddf024ebf5ad',557:'0906ffa955be21910b543f58575a80b6',558:'e11a92703c3716b2314f5456fee1c07e',559:'c1d1b0db8e3c013d8da73c8bc2e080b6',560:'5aff6642707086e31deb7f0b10d48162',561:'aa5a5840ee0394666aab9c9448396339',562:'25e62dbec091d762d5d3cfcb8a9cfc07',563:'6a0480f0b1c0c42c3f8996538331658e',564:'5ca47f35b2ff68fb4d71c07f85afd1da',565:'275e0e30fd242afe1850b86f77aba690',566:'960d61642e63bd282a2b5353cad11060',567:'70295e93af6d89f682fc1c0471a3e0b8',568:'0d91fd3a563111bb3080a98d1f8dbb1a',569:'1daa9ab0416e26fcd0dd0351e8213ea5',570:'83280a6f788d95d2e9bac7787001480e',571:'f676f4701b439d63b1a023a83bc139d2',572:'395847344178a464971371a85fc22da1',573:'b3e61c0ce2eba95f1cb0259920b35deb',574:'1541b3375b1b51633031f0fdfbcc4e53',575:'8466bf73bb66985a22a52cb915217782',576:'6eead1794659baa58fe149d5c2fc8618',577:'f2b9e32ee99bcbfd730840ff3b2306b3',578:'646d9634cf926644984a07b77e778450',579:'59ab8ac4063c7dbf59893ca8142b7f7e',580:'c3a2e435800df6b9457c953850d8e9d6',583:'81af2977ffd315b31fa30c1e0c105c7f',584:'ff88e02368f257df6d0062e61ae7812e',585:'b298d56bb1f9df9b68b3d7d017a08dfc',586:'193ee65aabd4268b5ee73e49afed22a6',587:'b1245d0c4979403f009fd7e9b2559812',588:'89e8d413ab6a69afc26e057eec5cb2b2',589:'023245f79c27b4050689999b7682c208',590:'23092e2b09d840d04b8549610274b570',591:'15536fce8b158c44ff76fd48699032cf',592:'3641f6337b3bf6a61660c79fafedd488',593:'70082d3039d307661605014519032c9b',594:'361f4566b1399797b0b93458561b81ad',595:'d68e728d778dddac06028d6a01f35386',596:'dd9129b3d6997c7c90a07c7a8d00d075',597:'7726429245001ff8e889f60d1cb505dc',598:'db90f83902e01561445319d75dc5ebee',599:'868a1f99977c7f184af87410583c81ec',600:'968715e98168c925d3758e281e75d50e',601:'82e08c74d9410b270cac6353735fe4aa',602:'632f83f56c949116814a092086159872',603:'2968e7767f84b958d9244602c06acf1b',604:'bf70c744a8a8de5759ebd9403f74086e',605:'70026de201c74f457751604d7ecbff9f',606:'65aa2d49b78611c731558456ac77856c',607:'46c1dd43114e5c3df522678fc4f71cb0',608:'816236c8c90ef0171705907fce08846a',609:'8e7044f5f2a14d24ee312579c33a1abe',610:'566986ad11026e5144a2f766419e10e8',611:'e51a3a1ccfe11780410f2a077230721b',612:'2ea990de24bb5215b4c02a68f9214f98',613:'32bb8554959a80aaa019b0d116fb620d',614:'7d94658a37609d4dfba16915c9fe3220',615:'669ab437d496df08c64e803af33fc50e',616:'0ce68eb0af9500be344060e82d5ef360',617:'539ac857a305d0e69363aaadabc4406a',618:'3aa66ad93ba24c085b99dee5cfc1cd32',619:'c1ba9df5265088a60f6106ebdbd47bdf',620:'719ebaf02db9826acaf0b6750e0bc421',622:'e9e5fdbb892a1aa4fac9ce86739b0bd7',623:'9254526142a48fa2c9efa31d39438873',624:'bcfecf21efac4a9e134773451a0ef83b',625:'c2afa68b87c65a48298496e6db6b6864'}
const currentStationMap = divvyStationMap;

const initializeDb = () => {
  this.fetch(`https://api.citybik.es/v2/networks`).then((response) => {
    return response.json()
  }).then((json) => {
  	console.log("networks", json);
    json["networks"].forEach((network) => {
      const networkDoc = db.collection("networks").doc(network.id);
      networkDoc.set(network, { merge: true }).then(() => {
        if(network.id === networkId) {
          //initializeNetwork(network.id, networkDoc);
        }
      });
    });
  });
}

const initializeNetwork = (networkId, networkDoc) => {
	this.fetch(`https://api.citybik.es/v2/networks/${networkId}`).then((response) => {
    return response.json()
  }).then((json) => {
  	console.log("stations", json);
    json["network"]["stations"].forEach((station) => {
      console.log(`Added ${station.id}`)
      networkDoc.collection("stations").doc(station.id).set(station, { merge: true });
    });
  })
}

const updateNetwork = (networkId, networkDoc, activityCallback) => {
  this.fetch(`https://api.citybik.es/v2/networks/${networkId}?fields=stations`).then((response) => {
    return response.json()
  }).then((json) => {
    json["network"]["stations"].forEach((station) => {
    	const stationDoc = networkDoc.collection("stations").doc(station.id);
      stationDoc.get().then((doc) => {
      	if(doc.exists) {
        	const oldStation = doc.data();
          if (oldStation.timestamp != station.timestamp) {
            let newRentals = station.extra.renting;
            let newReturns = station.extra.returning;

            if (!newRentals || !newReturns) {
              const deltaBikes = station.free_bikes - oldStation.free_bikes;
              newRentals = deltaBikes < 0 ? Math.abs(deltaBikes) : 0;
              newReturns = deltaBikes > 0 ? Math.abs(deltaBikes) : 0;
              station.extra.renting = newRentals;
              station.extra.returning = newReturns;
            }

            if (newRentals > 0 && activityCallback) {
              activityCallback(station, newRentals, newReturns);
            }

            stationDoc.set(station, { merge: true });
          }
        }
      });
    });
  })
}

// const progressBar = $("#trip-progress-bar");
// const progressText = document.getElementById("trip-progress-text");
// progressBar.progress();

// const updateProgress = (text, progress) => {
// 	progressText.textContent = text;
//   progressBar.progress({
//   	value: progress.addedTrips,
//     total: progress.totalTrips,
//   })
// }

const addFrequencies = (networkId, csv) => {
	return new Promise((resolve, reject) => {
  	const stationsRef = db.collection("networks").doc(networkId).collection("stations");
  	const routesRef = db.collection("networks").doc(networkId).collection("routes");
    const batch = db.batch();

    const frequenciesData = d3.csvParse(csv);
    frequenciesData.forEach((path, i) => {
      const startDbId = currentStationMap[path["start station id"]];
      const endDbId = currentStationMap[path["end station id"]];
      if(startDbId && endDbId) {
        const routeRef = routesRef.doc(`${startDbId} - ${endDbId}`);
        console.info(`Writing ${startDbId} - ${endDbId}: ${path["num trips"]}`)
        batch.set(routeRef, {
          startId: startDbId,
          endId: endDbId,
          frequency: parseInt(path["num trips"]),
      }, { merge: true });
      }
    })
    batch.commit().then(() => {
    	console.log('Batch frequency success.')
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

const handleFrequencyFile = (evt) => {
  const fileList = evt.target.files;
  for (let i = 0; i < fileList.length; i++) {
    console.log("Loading CSV");
  	const csvFile = evt.target.files[i];
    if(csvFile && csvFile.type == "text/csv") {
      const csvReader = new FileReader();
      csvReader.addEventListener("load", (evt) => {
        console.log("CSV Loaded");
        const csvText = event.target.result;
        const csvMeta = addFrequencies(networkId, csvText);
      });
      csvReader.readAsText(csvFile);
    }
  }
}


const routerOptions = {
  costing: 'bicycle',
  costing_options: {
  	bicycle: {
    	bicycle_type: "city",
      cycling_speed: 16,
      use_hills: .4,
    }
  }
};

const routeTrip = function (startStation, endStation, networkId) {
	return new Promise((resolve) => {
  	const stationsRef = db.collection("networks").doc(networkId).collection("stations");
    const routeRef = stationsRef.doc(startStation.id).collection("routes").doc(endStation.id);
    routeRef.get().then((routeDoc) => {
      if (!routeDoc.exists) {
        const routeOptions = Object.assign({
          locations: [
            { lat: startStation.latitude, lon: startStation.longitude },
            { lat: endStation.latitude, lon: endStation.longitude },
          ],
        }, routerOptions);
        const route = this.fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(routeOptions)}&api_key=${mapzenKey}`).then((response) => {
          if(response.ok) {
          	console.log("fetched route");
            return response.json();
          }
          throw new Error(response.statusText);
        }).then((json) => {
          if(json.trip.status == 0) {
            routeRef.set(json.trip.legs[0]);
          }
          resolve();
        }).catch((error) => {
          console.error(error);
          resolve();
        });
      } else {
      	resolve();
      }
    });
  });
}

const routeTrips = (networkId) => {
	const networkRef = db.collection("networks").doc(networkId);
	const tripsRef = networkRef.collection("trips").limit(5000);
	const stationsRef = networkRef.collection("stations");
  
  tripsRef.get().then((querySnapshot) => {
  	async.eachLimit(querySnapshot.docs, 2, async function (doc) {
      return new Promise((resolve) => {
        const trip = doc.data();
        console.log(trip);
        stationsRef.where("extra.uid", "==", trip["start station id"]).limit(1).get().then((querySnapshot) => {
          if(querySnapshot.docs.length < 1) {
            console.error(`station id ${trip["start station id"]} not found`);
            resolve();
          } else {
            const startStation = querySnapshot.docs[0].data();
            stationsRef.where("extra.uid", "==", trip["end station id"]).limit(1).get().then((querySnapshot) => {
              if(querySnapshot.docs.length < 1) {
                console.error(`station id ${trip["end station id"]} not found`);
                resolve();
              } else {
                const endStation = querySnapshot.docs[0].data();
                routeTrip(startStation, endStation, networkId).then(() => {
                	resolve();
								});
              }
            })
          }
        })
      });
    })
  	
  })
}

const routeRoute = (stationsRef, routesRef, routeId, route) => {
  return new Promise((resolve, reject) => {
    console.log(routeId, route);
    
    if (!route.shape) {
      stationsRef.doc(route.startId).get().then((startRef) => {
        if(startRef.exists) {
          const startStation = startRef.data();
          stationsRef.doc(route.endId).get().then((endRef) => {
            if(endRef.exists) {
              const endStation = endRef.data();
              const routeOptions = Object.assign({
                locations: [
                  { lat: startStation.latitude, lon: startStation.longitude },
                  { lat: endStation.latitude, lon: endStation.longitude },
                ],
              }, routerOptions);
              const route = this.fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(routeOptions)}&api_key=${mapzenKey}`).then((response) => {
                if(response.ok) {
                	console.log("fetched route");
                  return response.json();
                } else {
                  if(response.status === 400) {
                    setTimeout(() => {
                      resolve();
                    }, 350);
                  } else {
                    throw new Error(response.statusText);
                  }
                }
              }).then((json) => {
                const routeResult = json.trip.legs[0];
                routeResult.hasShape = true;
                if(json && json.trip.status == 0) {
                  routesRef.doc(routeId).set(routeResult, {merge: true});
                }
                setTimeout(() => {
                  resolve();
                }, 350);
              }).catch((error) => {
                console.error(error);
                reject(error);
              });
            } else {
              console.error(`Station ${route.endId} does not exist`);
              resolve();
            }
          })
        } else {
          console.error(`Station ${route.startId} does not exist`);
          resolve();
        }
      })
    } else if (!route.hasShape) {
      console.log("begin entry update");
      routesRef.doc(routeId).set({hasShape: true}, {merge: true}).then(() => {
        console.log("updating entry");
        resolve();
      });
    } else {
      resolve();
    }
  });
}

const routeRoutes = (networkId) => {
  const networkRef = db.collection("networks").doc(networkId);
  const stationsRef = networkRef.collection("stations");
  const routesRef = networkRef.collection("routes");
  
  routesRef.orderBy("frequency", "desc").get().then((querySnapshot) => {
    async.eachLimit(querySnapshot.docs, 1, async (doc) => {
      return new Promise((resolve) => {
        const route = doc.data();
        routeRoute(stationsRef, routesRef, doc.id, route).then(() => {
          resolve();
        });
      });
    })
  })
}

const renderStations = (networkId) => {
	const networkDocRef = db.collection("networks").doc(networkId);
  networkDocRef.get().then((doc) => {
  	const network = doc.data();
    // map.setView([network.location.latitude, network.location.longitude], 12);
  });
  const stationsLayer = L.featureGroup().addTo(map);
  const stationsMarkers = new Map();
  const stationsRef = networkDocRef.collection("stations");
  stationsRef.onSnapshot((querySnapshot) => {
  	querySnapshot.docChanges.forEach((change) => {
    	const station = change.doc.data();
    	if (change.type === "added") {
        stationsMarkers.set(`${networkId}-${station.id}`, L.marker([station.latitude, station.longitude], {
          icon: L.divIcon({
            className: `station-icon ${networkId}-${station.id}`,
            html: '',
            iconSize: [8,8],
          })
        })
        .bindPopup(JSON.stringify(station))
        .addTo(stationsLayer));
      }
      if (change.type === "modified") {
      	const marker = stationsMarkers.get(`${networkId}-${station.id}`);
        marker.setOpacity(.5);
        //TODO
      }
    })
    map.fitBounds(stationsLayer.getBounds(), {
    	padding: [32, 32]
    });
  })
}

const renderRoutes = (networkId) => {
  const networkDocRef = db.collection("networks").doc(networkId);
  const routesRef = networkDocRef.collection("routes");
  
  const routesLayer = L.featureGroup().addTo(map);
  
  routesRef.orderBy("frequency", "desc").limit(1).get().then((querySnapshot) => {
    const maxFrequency = querySnapshot.docs[0].data().frequency;
    
    routesRef.onSnapshot((querySnapshot) => {
      querySnapshot.docChanges.forEach((change) => {
        const route = change.doc.data();
        if (change.type === "added") {
          console.log(`Path for ${change.doc.id} added`);
          if (route.shape) {
          	const routeCoordinates = polylineDecode(route.shape);
        		const routePolyline = L.polyline(routeCoordinates, {
        		  className: change.doc.id,
        		  color: "#177EA3", 
        		  opacity: route.frequency / maxFrequency * .5,
        		}).addTo(routesLayer);
          }
        }
      })
    })
  });
  
}

const polylineDecode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

// Render Hubway
initializeDb();
//updateNetwork(networkId, db.collection("networks").doc(networkId), (station, newRentals, newReturns) => {
	//console.log(station, newRentals, newReturns);
//});
renderStations(networkId);
//renderRoutes(networkId);

document.getElementById("initialize-button").addEventListener("click", () => {
	initializeNetwork(networkId, db.collection("networks").doc(networkId));
}, false);

document.getElementById("pathfind-button").addEventListener("click", () => {
	routeRoutes(networkId);
}, false);

const frequencyFileElement = document.getElementById("frequency-file");
frequencyFileElement.addEventListener("change", handleFrequencyFile, false);