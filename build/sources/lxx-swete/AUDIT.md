# Greek LXX Swete source audit

AUDIT ONLY. Pinned snapshots; no importer or application/data changes.

Read-only UTF-8 fatal decode, SHA-256 verification, XML validation/preserve-order parsing. A token rows grouped by reference; B main verse text excludes XML notes and heads for diagnostic comparison only. No Scripture writes. Counts exclude verse 0 and nonnumeric IDs; these are reported separately. Artifact counts are heuristic occurrences, not proof every candidate is an error; all XML notes outside verses counted too. XML-leftover patterns are candidates (angle brackets can be editorial, not XML). XML pb/lb/head counts describe source markup. B coverage/quality/structure only include Greek files whose own sourceDesc names Swete; every downloaded edition/commentary file is license-checked.


## A: nathans/lxx-swete

Commit: 26bad3eb42bba98471d154c954e36a6f30a0279d

Fetch date (UTC): 2026-10-06T20:29:09.406Z

Manifest verification failures: 0

| File | Bytes | SHA-256 |
| --- | --- | --- |
| .gitignore | 769 | 06db4ff28c89863c8c67cbc9744639763df73ebeac5fd9f6d10665da2bd25f64 |
| COPYING-Code | 1090 | ae21033db0eb664b0be84881d8993a32357e0cf66e6961a37bba0844b8e695d2 |
| data/01.Genesis.txt | 609070 | b5abf507f757de3c96f3e44944515dba46d6e5b9edd8e653d7ce6096588c5ce6 |
| data/02.Exodus.txt | 467921 | 4bb3c26c12eca623d9a046a9555b64d02ece86395e80fd0771bd6a73da544b3f |
| data/03.Leviticus.txt | 361378 | 128bed9e2c43b66d66bd8346625b88a316e97f8beef52eddb951659e4b0889ea |
| data/04.Numeri.txt | 482340 | 0df68398862fdf9cba702d389cd35addde8a7e4abc242f65e4a2dc6087745d0a |
| data/05.Deuteronomium.txt | 420583 | acd34130bb39d38761394187037519887c854beb4756213e86f71f3e4ac46a2d |
| data/06.Josue.txt | 280046 | eed9d9f69c4d00d7a4f69b57b2363996534abaa032782a4e32a477df747e3718 |
| data/08.Judices.txt | 295617 | cbd80deb4b5277f4677eed288e6c42286f50cb4ccb7d47656e543502785ad6a5 |
| data/10.Ruth.txt | 38693 | 74c76b5c6ce7e4743454012fb0d3d34b46422a3e763dca1ef072677c1f808ff2 |
| data/11.Regnorum_I.txt | 394487 | c09643dab2d81c2ec1b9f79d3804ab6d2487dc0629e8a2a10dc1dd33f7360aa8 |
| data/12.Regnorum_II.txt | 354314 | 328d750ec1d4e913d49f14d853cf7b5494a5fd97f27b2a429245e749a5a121c6 |
| data/13.Regnorum_III.txt | 409463 | 4b129f8d93e675c87974581febbac076cf42cba65d044fede612afe6efb06ac7 |
| data/14.Regnorum_IV.txt | 369273 | 7303b2cd6ccdb6dab85a4db6c081f913a84ac15fe9b52c09b3e7a56a5a049859 |
| data/15.Paralipomenon_I.txt | 324032 | fb7410ec4fc50e7be9c8bb9bf156f90bf5ae011490b47636be0554be5cead132 |
| data/16.Paralipomenon_II.txt | 428359 | e9386c1e42b1b341af9bc5c70d531c3b55851ed1dcff7297afba0f39f6e8936b |
| data/17.Esdras_A.txt | 179011 | f6c5eb90525214da21f03fce1cef9aa27d8c953fc0ad1c3808a4923bd291141c |
| data/18.Esdras_B.txt | 259420 | d621cf1c1c9d5fc6b4c96aa1458e27c729f7d90afaff0eb826a6f7fb6a3dafd9 |
| data/19.Esther.txt | 119662 | 1c0cddd3f52475f02041b629fd852aefbe3f7187de4767f22ca581a4d0df74b3 |
| data/20.Judith.txt | 182556 | ba3754992acd36d62bb33deb9e55d36c0afff9a0bd85a0477a6faa6346d14b65 |
| data/21.Tobias.txt | 108027 | 8579c33a068422a483a0ed9f8a8c18ca4e47a939a8ed905cfeb781870fcd47a5 |
| data/23.Machabaeorum_i.txt | 378842 | eadb7e31bef384a95c04f1e87215161e888adcb0a1eb7c3b8ad622538f21d2dd |
| data/24.Machabaeorum_ii.txt | 253718 | dfc6fa72df82fc9f7b7dddfba217bd9d23f594f2becbc842cea06ab67bef20e0 |
| data/25.Machabaeorum_iii.txt | 107467 | d25c51be1121d1bffa81f4ce9438c43f840aa3f8629be7fd903c0ca9434fda56 |
| data/26.Machabaeorum_iv.txt | 166277 | 1e5ff49eb9a28401d97a23f876e42ff51b07871c7d28dd8668608f6549f50146 |
| data/27.Psalmi.txt | 716207 | d9a8fe86689e23c8b5b04d8edc857a1861362eccb03514e92560b7f048785e2e |
| data/28.Odae.txt | 85098 | 4bf8082210d4564fca47c9914401346dc50b36ce606f8f5559b863c799b477b3 |
| data/29.Proverbia.txt | 236102 | 2141b7c391b9573761693b099434f697707c90b6e2d34327cec428de9f4147cf |
| data/31.Canticum.txt | 38656 | 44bb7caeefcf5b71c7c20ac2703461588df00c7f53b92dd9cb6b4753140288bb |
| data/32.Job.txt | 274902 | 9ec5ee80fdb7d13ee50a570204500d07a250db49005244948b34b7ded7590420 |
| data/33.Sapientia_Salomonis.txt | 142008 | 7cc9ee8002a4779df009da3882cc375326326e30fad7e0d08554de9cb1577d49 |
| data/34.Ecclesiasticus.txt | 397505 | 2f7dc2f23fee709008d56c25d8bcd55f708bc8c0412872463c46dbde876b3482 |
| data/35.Psalmi_Salomonis.txt | 98538 | c1fc63b38fa47c4122c748c25a00031072403622a4a8cf2c2028ce8404ac4855 |
| data/36.Osee.txt | 78218 | 2395840e963c3ec4b1bae52f59fe6500c4fe89b12de290dff566eb60d1a45de9 |
| data/37.Amos.txt | 62756 | 0381589d6b31fa0b7bf383ce84e03954922952884b06b29cf7bcf8962c0e394b |
| data/38.Michaeas.txt | 45595 | 1730de10cf2c11a98558ec51766b6e75f313cdfae02961b64c50e8a3ad5a8c1d |
| data/39.Joel.txt | 31279 | 82f9238818b107cf76ef9a85dbe3f7944b90b2916f5ba5e290e097c23084f03a |
| data/40.Abdias.txt | 9030 | f2b8a9677b1db371cd8b1d2e4a0b397368f3b8dcc49408ab4315cca159646901 |
| data/41.Jonas.txt | 20200 | bbb412a35e93837ffa5c86b2a2a82cf3d03004e486f9da2b99dc0067691ca803 |
| data/42.Nahum.txt | 18679 | 8d770110c51a202f704a3b8f12cf9006088e31bee1e507a09e3139e8b96a8430 |
| data/43.Habacuc.txt | 21567 | a15ef89d9cda964dd30f9c89a8c2938f71dced39ba988335e2bee2015294f0f7 |
| data/44.Sophonias.txt | 24214 | 750e4ced569de1b40b1b9729ec50cd36f494dc0d61a06f7552c47bf7ec510514 |
| data/45.Aggaeus.txt | 18140 | 5082f5767446b107cc06be42eacdf1130b0e2f676c263319bfed75d6a1ce9b70 |
| data/46.Zacharias.txt | 98453 | 6d1c90bfc984ee5edec67185bf017c3fec4adeeee18f8584e0da2e86de84fc6a |
| data/47.Malachias.txt | 27832 | 658319fa9df4c1190f2fd311c0584069091f43034b407a373994758320f4f5be |
| data/48.Isaias.txt | 553905 | e552647fd45e3c06ee506659536be1193fc88779e2c225ee8d963f97ecd4c5e0 |
| data/49.Jeremias.txt | 590067 | 65eb6935b8c739b4043193d3086b069065672bb3ae54f450b763691d4266e49b |
| data/50.Baruch.txt | 50760 | 7bfcb974fee799e9494e3db0892c6d28f90e90e20f5bb8ec6c2125fb263f0b65 |
| data/51.Threni_seu_Lamentationes.txt | 50322 | 9954dfed87259610e3a13505b920c36d3f476a41f1e587c54bd25efa2538a91d |
| data/52.Epistula_Jeremiae.txt | 26169 | 9259f2bf8f623730fe5c0ecb3c874c1433a71e3e8e38a48d3d4f51b5d1bbe587 |
| data/53.Ezechiel.txt | 594863 | 3cadcb2c2e714c5af7a937d253b545c9f5982b77811910870529bf9d5c5c3dd6 |
| data/54.Susanna_translatio_Graeca.txt | 18210 | d2bb68ccf067fb56c89189a19e2a4c8ba3aa39ff2094597c3f49fcbbdef91d7a |
| data/55.Susanna_Theodotionis_versio.txt | 22953 | 6cda918133aac828d9bb80b1c2bc56ee8409bf242a916ef566e9c2a8e1e8c633 |
| data/56.Daniel_translatio_Graeca.txt | 219641 | 7886e521a698af3fd2619b199fd2e1f1f6977bbd927ca66b79a3b50b64304c00 |
| data/57.Daniel_Theodotionis_versio.txt | 200591 | 4d9fbcabb7991a1cbab6e703e2a5b906a630424fa60dd0011cc9cf21fb01569f |
| data/58.Bel_et_Draco_translatio_Graeca.txt | 17452 | 32c0d1d26d98cd93ceb57ba3b82f6ef9352deae12a79d17da2e03fb44f0d4df5 |
| data/59.Bel_et_Draco_Theodotionis_versio.txt | 14730 | 53158038827e0b0d1c288ad7f9a759632d9a0cf5ab6bf7852d4211181e919f72 |
| README.md | 845 | ca5869019f542d01ae0ecd9e0381ddbfe6bd0a6c14ed7edf52b8d0973634c325 |
| utils/build.sh | 1367 | c05237a5acd15847f5af77ce325d7ff86a9f5ce7663085a970ed14c966cc2a74 |
| utils/convert-swete.py | 8780 | 2d83b3bc3b146c07d16032482fccd19e9e68a1bdc0a336f079f7e97d59a9633e |
| utils/README.md | 324 | 627d1d0c85a318edda59040ce390263012e20b857bbe641a5254af9d300f84e1 |

## A per-book-file header license

| File | License text found | Consistent with CC BY-SA 4.0? |
| --- | --- | --- |
| data/01.Genesis.txt | MISSING | N |
| data/02.Exodus.txt | MISSING | N |
| data/03.Leviticus.txt | MISSING | N |
| data/04.Numeri.txt | MISSING | N |
| data/05.Deuteronomium.txt | MISSING | N |
| data/06.Josue.txt | MISSING | N |
| data/08.Judices.txt | MISSING | N |
| data/10.Ruth.txt | MISSING | N |
| data/11.Regnorum_I.txt | MISSING | N |
| data/12.Regnorum_II.txt | MISSING | N |
| data/13.Regnorum_III.txt | MISSING | N |
| data/14.Regnorum_IV.txt | MISSING | N |
| data/15.Paralipomenon_I.txt | MISSING | N |
| data/16.Paralipomenon_II.txt | MISSING | N |
| data/17.Esdras_A.txt | MISSING | N |
| data/18.Esdras_B.txt | MISSING | N |
| data/19.Esther.txt | MISSING | N |
| data/20.Judith.txt | MISSING | N |
| data/21.Tobias.txt | MISSING | N |
| data/23.Machabaeorum_i.txt | MISSING | N |
| data/24.Machabaeorum_ii.txt | MISSING | N |
| data/25.Machabaeorum_iii.txt | MISSING | N |
| data/26.Machabaeorum_iv.txt | MISSING | N |
| data/27.Psalmi.txt | MISSING | N |
| data/28.Odae.txt | MISSING | N |
| data/29.Proverbia.txt | MISSING | N |
| data/31.Canticum.txt | MISSING | N |
| data/32.Job.txt | MISSING | N |
| data/33.Sapientia_Salomonis.txt | MISSING | N |
| data/34.Ecclesiasticus.txt | MISSING | N |
| data/35.Psalmi_Salomonis.txt | MISSING | N |
| data/36.Osee.txt | MISSING | N |
| data/37.Amos.txt | MISSING | N |
| data/38.Michaeas.txt | MISSING | N |
| data/39.Joel.txt | MISSING | N |
| data/40.Abdias.txt | MISSING | N |
| data/41.Jonas.txt | MISSING | N |
| data/42.Nahum.txt | MISSING | N |
| data/43.Habacuc.txt | MISSING | N |
| data/44.Sophonias.txt | MISSING | N |
| data/45.Aggaeus.txt | MISSING | N |
| data/46.Zacharias.txt | MISSING | N |
| data/47.Malachias.txt | MISSING | N |
| data/48.Isaias.txt | MISSING | N |
| data/49.Jeremias.txt | MISSING | N |
| data/50.Baruch.txt | MISSING | N |
| data/51.Threni_seu_Lamentationes.txt | MISSING | N |
| data/52.Epistula_Jeremiae.txt | MISSING | N |
| data/53.Ezechiel.txt | MISSING | N |
| data/54.Susanna_translatio_Graeca.txt | MISSING | N |
| data/55.Susanna_Theodotionis_versio.txt | MISSING | N |
| data/56.Daniel_translatio_Graeca.txt | MISSING | N |
| data/57.Daniel_Theodotionis_versio.txt | MISSING | N |
| data/58.Bel_et_Draco_translatio_Graeca.txt | MISSING | N |
| data/59.Bel_et_Draco_Theodotionis_versio.txt | MISSING | N |

## A excluded non-Swete editions / commentary

| File | Rejection reason from own file header |
| --- | --- |


A missing per-file header does not override the repository README license grant, but fails the requested per-file-header criterion. Metadata __cts__.xml files are inventoried but are not book text files. B licenses are extracted only from each TEI header, never inferred from the repo.

## A coverage

| File | Canon ID / content | Chapter labels | Verse records |
| --- | --- | --- | --- |
| data/01.Genesis.txt | GEN | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50 | 1523 |
| data/02.Exodus.txt | EXO | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40 | 1160 |
| data/03.Leviticus.txt | LEV | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27 | 858 |
| data/04.Numeri.txt | NUM | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36 | 1285 |
| data/05.Deuteronomium.txt | DEU | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34 | 947 |
| data/06.Josue.txt | JOS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24 | 661 |
| data/08.Judices.txt | JDG | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21 | 618 |
| data/10.Ruth.txt | RUT | 1,2,3,4 | 85 |
| data/11.Regnorum_I.txt | 1SA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31 | 767 |
| data/12.Regnorum_II.txt | 2SA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24 | 695 |
| data/13.Regnorum_III.txt | 1KI | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22 | 829 |
| data/14.Regnorum_IV.txt | 2KI | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25 | 721 |
| data/15.Paralipomenon_I.txt | 1CH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29 | 922 |
| data/16.Paralipomenon_II.txt | 2CH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36 | 827 |
| data/17.Esdras_A.txt | 1 Esdras | 1,2,3,4,5,6,7,8,9 | 430 |
| data/18.Esdras_B.txt | EZR+NEH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 | 649 |
| data/19.Esther.txt | EST | prologue,1,2,3,4,5,6,7,8,9,10 | 266 |
| data/20.Judith.txt | JDT | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 | 339 |
| data/21.Tobias.txt | TOB | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 243 |
| data/23.Machabaeorum_i.txt | 1MA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 | 921 |
| data/24.Machabaeorum_ii.txt | 2MA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 | 553 |
| data/25.Machabaeorum_iii.txt | 3 Maccabees | 1,2,3,4,5,6,7 | 227 |
| data/26.Machabaeorum_iv.txt | 4 Maccabees | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18 | 481 |
| data/27.Psalmi.txt | PSA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151 | 2551 |
| data/28.Odae.txt | Odes (including Prayer of Manasseh) | 1,2,3,iva,ivb,5,6,7,8,9,10,11,12,13,14 | 238 |
| data/29.Proverbia.txt | PRO | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29 | 928 |
| data/31.Canticum.txt | SNG | 1,2,3,4,5,6,7,8 | 116 |
| data/32.Job.txt | JOB | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42 | 1078 |
| data/33.Sapientia_Salomonis.txt | WIS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20 | 424 |
| data/34.Ecclesiasticus.txt | SIR | 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51 | 1370 |
| data/35.Psalmi_Salomonis.txt | Psalms of Solomon | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18 | 340 |
| data/36.Osee.txt | HOS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 197 |
| data/37.Amos.txt | AMO | 1,2,3,4,5,6,7,8,9 | 146 |
| data/38.Michaeas.txt | MIC | 1,2,3,4,5,6,7 | 105 |
| data/39.Joel.txt | JOL | 1,2,3 | 73 |
| data/40.Abdias.txt | OBA | 1 | 22 |
| data/41.Jonas.txt | JON | 1,2,3,4 | 48 |
| data/42.Nahum.txt | NAM | 1,2,3 | 48 |
| data/43.Habacuc.txt | HAB | 1,2,3 | 56 |
| data/44.Sophonias.txt | ZEP | 1,2,3 | 51 |
| data/45.Aggaeus.txt | HAG | 1,2 | 37 |
| data/46.Zacharias.txt | ZEC | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 210 |
| data/47.Malachias.txt | MAL | 1,2,3,4 | 55 |
| data/48.Isaias.txt | ISA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66 | 1279 |
| data/49.Jeremias.txt | JER | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52 | 1293 |
| data/50.Baruch.txt | BAR | 1,2,3,4,5 | 141 |
| data/51.Threni_seu_Lamentationes.txt | LAM | 1,2,3,4,5 | 151 |
| data/52.Epistula_Jeremiae.txt | Letter of Jeremiah (Catholic Baruch 6 component) | 0 | 73 |
| data/53.Ezechiel.txt | EZK | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48 | 1262 |
| data/54.Susanna_translatio_Graeca.txt | Susanna Old Greek (Daniel component) | 1 | 46 |
| data/55.Susanna_Theodotionis_versio.txt | Susanna Theodotion (Daniel component) | 1 | 64 |
| data/56.Daniel_translatio_Graeca.txt | DAN | 1,2,3,4,5,6,7,8,9,10,11,12 | 416 |
| data/57.Daniel_Theodotionis_versio.txt | DAN | 1,2,3,4,5,6,7,8,9,10,11,12 | 412 |
| data/58.Bel_et_Draco_translatio_Graeca.txt | Bel and Dragon Old Greek (Daniel component) | 1 | 35 |
| data/59.Bel_et_Draco_Theodotionis_versio.txt | Bel and Dragon Theodotion (Daniel component) | 1 | 36 |

In-canon present (45): GEN, EXO, LEV, NUM, DEU, JOS, JDG, RUT, 1SA, 2SA, 1KI, 2KI, 1CH, 2CH, EZR, NEH, TOB, JDT, EST, 1MA, 2MA, JOB, PSA, PRO, SNG, WIS, SIR, ISA, JER, LAM, BAR, EZK, DAN, HOS, JOL, AMO, OBA, JON, MIC, NAM, HAB, ZEP, HAG, ZEC, MAL

In-canon missing (28): ECC, MAT, MRK, LUK, JHN, ACT, ROM, 1CO, 2CO, GAL, EPH, PHP, COL, 1TH, 2TH, 1TI, 2TI, TIT, PHM, HEB, JAS, 1PE, 2PE, 1JN, 2JN, 3JN, JUD, REV

Out-of-canon files: 1 Esdras [data/17.Esdras_A.txt]; 3 Maccabees [data/25.Machabaeorum_iii.txt]; 4 Maccabees [data/26.Machabaeorum_iv.txt]; Odes (including Prayer of Manasseh) [data/28.Odae.txt]; Psalms of Solomon [data/35.Psalmi_Salomonis.txt]. Psalm 151 is embedded in Psalmi, not a separate file. Components of in-canon Daniel/Baruch are listed separately, not classified as excluded books.

Baruch is file 50, Letter of Jeremiah file 52; the letter is not already Baruch chapter 6. Susanna files 54/55 and Bel files 58/59 are separate Old Greek / Theodotion witnesses. Daniel files 56/57 are also separate witnesses; their chapter 3 counts are below. Esther is file 19 and includes a nonnumeric prologue: keep original references. Esdras B file 18 combines Ezra/Nehemiah; audit labels chapters 1-10 EZR and 11 onward NEH with diagnostic -10 chapter indexing; this is not an approved import mapping. Odes chapter 8 contains Prayer of Manasseh; detached title evidence is below.

## A encoding and polytonic inventory

| File | UTF-8 valid | BOM | Raw NFC | Raw NFD | Verse NFC exceptions | Greek letters | Greek Extended code points | Combining marks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data/01.Genesis.txt | true | false | true | false | 0 | 147996 | 31203 | 10 |
| data/02.Exodus.txt | true | false | true | false | 0 | 117202 | 22504 | 7 |
| data/03.Leviticus.txt | true | false | true | false | 0 | 89761 | 18778 | 0 |
| data/04.Numeri.txt | true | false | true | false | 0 | 122067 | 24131 | 4 |
| data/05.Deuteronomium.txt | true | false | true | false | 0 | 104741 | 20688 | 0 |
| data/06.Josue.txt | true | false | true | false | 0 | 70836 | 14464 | 1 |
| data/08.Judices.txt | true | false | true | false | 0 | 74511 | 15166 | 0 |
| data/10.Ruth.txt | true | false | true | false | 0 | 9514 | 1865 | 0 |
| data/11.Regnorum_I.txt | true | false | true | false | 0 | 93366 | 18565 | 1 |
| data/12.Regnorum_II.txt | true | false | true | false | 0 | 84236 | 16888 | 1 |
| data/13.Regnorum_III.txt | true | false | true | false | 0 | 97958 | 19018 | 0 |
| data/14.Regnorum_IV.txt | true | false | true | false | 0 | 88581 | 17984 | 1 |
| data/15.Paralipomenon_I.txt | true | false | true | false | 0 | 77842 | 16177 | 0 |
| data/16.Paralipomenon_II.txt | true | false | true | false | 0 | 103644 | 20469 | 0 |
| data/17.Esdras_A.txt | true | false | true | false | 0 | 45653 | 8385 | 0 |
| data/18.Esdras_B.txt | true | false | true | false | 0 | 63241 | 12906 | 0 |
| data/19.Esther.txt | true | false | true | false | 0 | 29918 | 5396 | 0 |
| data/20.Judith.txt | true | false | true | false | 0 | 45086 | 8814 | 0 |
| data/21.Tobias.txt | true | false | true | false | 0 | 26672 | 5136 | 0 |
| data/23.Machabaeorum_i.txt | true | false | true | false | 0 | 94125 | 17641 | 0 |
| data/24.Machabaeorum_ii.txt | true | false | true | false | 0 | 66570 | 10083 | 0 |
| data/25.Machabaeorum_iii.txt | true | false | true | false | 0 | 29133 | 4303 | 0 |
| data/26.Machabaeorum_iv.txt | true | false | true | false | 0 | 43042 | 6719 | 0 |
| data/27.Psalmi.txt | true | false | true | false | 0 | 169939 | 29948 | 0 |
| data/28.Odae.txt | true | false | true | false | 0 | 20831 | 3824 | 0 |
| data/29.Proverbia.txt | true | false | true | false | 0 | 59334 | 9814 | 2 |
| data/31.Canticum.txt | true | false | true | false | 0 | 9986 | 1617 | 0 |
| data/32.Job.txt | true | false | true | false | 0 | 66067 | 12138 | 0 |
| data/33.Sapientia_Salomonis.txt | true | false | true | false | 0 | 36388 | 5905 | 0 |
| data/34.Ecclesiasticus.txt | true | false | true | false | 0 | 98694 | 17094 | 0 |
| data/35.Psalmi_Salomonis.txt | true | false | true | false | 0 | 24314 | 4802 | 0 |
| data/36.Osee.txt | true | false | true | false | 0 | 19777 | 3720 | 0 |
| data/37.Amos.txt | true | false | true | false | 0 | 16087 | 2953 | 0 |
| data/38.Michaeas.txt | true | false | true | false | 0 | 11714 | 2097 | 0 |
| data/39.Joel.txt | true | false | true | false | 0 | 7975 | 1448 | 0 |
| data/40.Abdias.txt | true | false | true | false | 0 | 2284 | 439 | 0 |
| data/41.Jonas.txt | true | false | true | false | 0 | 5063 | 955 | 0 |
| data/42.Nahum.txt | true | false | true | false | 0 | 4878 | 819 | 0 |
| data/43.Habacuc.txt | true | false | true | false | 0 | 5514 | 949 | 0 |
| data/44.Sophonias.txt | true | false | true | false | 0 | 6218 | 1132 | 0 |
| data/45.Aggaeus.txt | true | false | true | false | 0 | 4530 | 844 | 0 |
| data/46.Zacharias.txt | true | false | true | false | 0 | 24849 | 4397 | 0 |
| data/47.Malachias.txt | true | false | true | false | 0 | 7226 | 1236 | 0 |
| data/48.Isaias.txt | true | false | true | false | 0 | 133769 | 24563 | 0 |
| data/49.Jeremias.txt | true | false | true | false | 0 | 143012 | 26852 | 0 |
| data/50.Baruch.txt | true | false | true | false | 0 | 12687 | 2495 | 0 |
| data/51.Threni_seu_Lamentationes.txt | true | false | true | false | 0 | 13109 | 2161 | 0 |
| data/52.Epistula_Jeremiae.txt | true | false | true | false | 0 | 6674 | 1211 | 0 |
| data/53.Ezechiel.txt | true | false | true | false | 0 | 141453 | 26811 | 0 |
| data/54.Susanna_translatio_Graeca.txt | true | false | true | false | 0 | 4617 | 841 | 0 |
| data/55.Susanna_Theodotionis_versio.txt | true | false | true | false | 0 | 5813 | 1048 | 0 |
| data/56.Daniel_translatio_Graeca.txt | true | false | true | false | 0 | 54501 | 10171 | 0 |
| data/57.Daniel_Theodotionis_versio.txt | true | false | true | false | 0 | 49553 | 9461 | 0 |
| data/58.Bel_et_Draco_translatio_Graeca.txt | true | false | true | false | 0 | 4297 | 796 | 0 |
| data/59.Bel_et_Draco_Theodotionis_versio.txt | true | false | true | false | 0 | 3627 | 684 | 0 |

Greek Extended/combining marks confirm polytonic characters survive, not textual correctness. Mixed Latin/Greek and suspicious isolated Latin tokens are flagged rather than converted. NFC is tested, not applied to cached source bytes. NFD counts are available in audit JSON.

## A artifacts: counts and up to 10 examples EACH


### Latin-script tokens (suspected OCR / sigla): 513

| File | Reference | Observed sample |
| --- | --- | --- |
| data/01.Genesis.txt | 8:4 | Áραρἀτ. :: καὶ ἐκάθισεν ἡ κιβωτὸς ἐν μηνὶ τῷ ἑβδόμῳ, ἑβδόμῃ καὶ εἰκάδι τοῦ μηνός, ἐπὶ τὰ ὄρη τὰ Áραρἀτ. |
| data/01.Genesis.txt | 8:22 | καταIX :: πάσας τὰς ἡμέρας τῆς γῆς σπέρμα θερισμός, ψῦχος καὶ καῦμα, θέρος καὶ ἔαρ ἡμέραν καὶ νύκτα οὐ καταIX |
| data/01.Genesis.txt | 9:1 | IXκαὶ :: IXκαὶ εἶπεν αὐτοῖς Αὐξάνεσθε καὶ πληθύνεσθε, καὶ πληρώσατε τὴν γῆν καὶ κατακυριεύσατε αὐτῆς. |
| data/01.Genesis.txt | 11:4 | L :: καὶ εἶπαν Δεῦτε μὲν ἐαυτοῖς πόλιν καὶ πύργον, οὗ ἡ κεφαλὴ ἔσται ἕως τοῦ οὐρανοῦ, καὶ ποιήσομεν ἑαυτῶν ὄνομα πρὸ τοῦ διασπαρῆναι ἐπὶ προσώπου πάσης L τῆς γῆς. |
| data/01.Genesis.txt | 11:19 | θηατέρnς, :: καὶ ἔζησεν Φάλεκ μετὰ τὸ γεννῆσαι αὐτὸν τὸν Ῥαγαὺ διακόσια ἐννέα ἔτη, καὶ ἐγέννησεν υἱοὺς καὶ θηατέρnς, καὶ ἀπέθανεν. |
| data/01.Genesis.txt | 11:31 | γυmῖκα :: καὶ ἔλαβεν Θορὰ τὸν Ἁβρὰμ τὸν υἱὸν αὐτοῦ καὶ τὸν Λὼτ υἱὸν Ἁρρόν, υἱὸν τοῦ υἱοῦ αὐτοῦ, καὶ τὴν Σάραν τὴν νύμφην αὐτοῦ, γυmῖκα τοῦ υἱοῦ αὐτοῦ, καὶ ἐξήγαγεν αὐτοὺς ἐκ τῆς χώρας τῶν Χαλδαίων πορ |
| data/01.Genesis.txt | 12:14 | Μrπτον, :: ἐγένετο δὲ ἡνίκα εἰσῆλθεν Ἀβράμ εἰς Μrπτον, ἰδόντες οἱ Αἰγύπτιοι τὴν γυναῖκα αὐτοῦ ὅτι καλὴ ἦν σφόδρα, |
| data/01.Genesis.txt | 12:15 | αm̓ὴν :: καὶ ἴδον αὐτὴν οἱ ἄρχοντες Φαραὼ καὶ ἐπῄνεσαν αm̓ὴν πρὸς Φαραὼ καὶ εἰσήγαγον αὐτὴν πρὸς Φαραώ. |
| data/01.Genesis.txt | 12:16 | αm̓ήν, :: καὶ τῷ Ἁβρὰμ εὑ ἐχρήσαντο δι' αm̓ήν, καὶ ἐγένοντο αὐτῷ πρόβατα καὶ μόσχοι καὶ ὄνοι, παῖδες κα παδσκαι, ἡμίονοι καὶ κάμηλοι. |
| data/01.Genesis.txt | 17:15 | αm̓ῆς· :: Εἶρεν δὲ ὁ θεὸς τῷ Ἀβραάμ Σάρα ἡ γυνή σου, οὐ κληθήσεται τὸ ὄνομα αὐτῆς Σάρα, ἀλλὰ Σάρρα ἔσται τὸ ὄνομα αm̓ῆς· |

### mixed-script Greek/Latin tokens: 341

| File | Reference | Observed sample |
| --- | --- | --- |
| data/01.Genesis.txt | 8:4 | Áραρἀτ. :: καὶ ἐκάθισεν ἡ κιβωτὸς ἐν μηνὶ τῷ ἑβδόμῳ, ἑβδόμῃ καὶ εἰκάδι τοῦ μηνός, ἐπὶ τὰ ὄρη τὰ Áραρἀτ. |
| data/01.Genesis.txt | 8:22 | καταIX :: πάσας τὰς ἡμέρας τῆς γῆς σπέρμα θερισμός, ψῦχος καὶ καῦμα, θέρος καὶ ἔαρ ἡμέραν καὶ νύκτα οὐ καταIX |
| data/01.Genesis.txt | 9:1 | IXκαὶ :: IXκαὶ εἶπεν αὐτοῖς Αὐξάνεσθε καὶ πληθύνεσθε, καὶ πληρώσατε τὴν γῆν καὶ κατακυριεύσατε αὐτῆς. |
| data/01.Genesis.txt | 11:19 | θηατέρnς, :: καὶ ἔζησεν Φάλεκ μετὰ τὸ γεννῆσαι αὐτὸν τὸν Ῥαγαὺ διακόσια ἐννέα ἔτη, καὶ ἐγέννησεν υἱοὺς καὶ θηατέρnς, καὶ ἀπέθανεν. |
| data/01.Genesis.txt | 11:31 | γυmῖκα :: καὶ ἔλαβεν Θορὰ τὸν Ἁβρὰμ τὸν υἱὸν αὐτοῦ καὶ τὸν Λὼτ υἱὸν Ἁρρόν, υἱὸν τοῦ υἱοῦ αὐτοῦ, καὶ τὴν Σάραν τὴν νύμφην αὐτοῦ, γυmῖκα τοῦ υἱοῦ αὐτοῦ, καὶ ἐξήγαγεν αὐτοὺς ἐκ τῆς χώρας τῶν Χαλδαίων πορ |
| data/01.Genesis.txt | 12:14 | Μrπτον, :: ἐγένετο δὲ ἡνίκα εἰσῆλθεν Ἀβράμ εἰς Μrπτον, ἰδόντες οἱ Αἰγύπτιοι τὴν γυναῖκα αὐτοῦ ὅτι καλὴ ἦν σφόδρα, |
| data/01.Genesis.txt | 12:15 | αm̓ὴν :: καὶ ἴδον αὐτὴν οἱ ἄρχοντες Φαραὼ καὶ ἐπῄνεσαν αm̓ὴν πρὸς Φαραὼ καὶ εἰσήγαγον αὐτὴν πρὸς Φαραώ. |
| data/01.Genesis.txt | 12:16 | αm̓ήν, :: καὶ τῷ Ἁβρὰμ εὑ ἐχρήσαντο δι' αm̓ήν, καὶ ἐγένοντο αὐτῷ πρόβατα καὶ μόσχοι καὶ ὄνοι, παῖδες κα παδσκαι, ἡμίονοι καὶ κάμηλοι. |
| data/01.Genesis.txt | 17:15 | αm̓ῆς· :: Εἶρεν δὲ ὁ θεὸς τῷ Ἀβραάμ Σάρα ἡ γυνή σου, οὐ κληθήσεται τὸ ὄνομα αὐτῆς Σάρα, ἀλλὰ Σάρρα ἔσται τὸ ὄνομα αm̓ῆς· |
| data/01.Genesis.txt | 17:20 | ’lσμαὴλ :: πεπὶ δὲ ’lσμαὴλ ἰδοὺ ἐπήκουσά σου· καὶ εὐλόγησα αὐτόν, καὶ αὐξάνω αὐτὸν καὶ πληθυνῶ αὐτὸν σφόδρα· δώδεκα ἔθνη γεννήσει, καὶ δώσω αὐτὸν εἰς ἔθνος μέγα. |

### isolated digit tokens: 23

| File | Reference | Observed sample |
| --- | --- | --- |
| data/01.Genesis.txt | 15:18 | 20 :: ἐκεῖ διέθετο ὁ θεὸς τῷ Ἀβρὰμ διαθήκην λέγων τῷ σπέρματί σου δώσω τὴν γῆν ταύτην, ἀπὸ τοῦ ποταμοῦ Αἰγύπτου ἕως τοῦ ποταμοῦ τοῦ μεγάλου Εὐφμάτου· τούς Κεναίους καὶ τοὺς ενεζαίους καὶ τοὺς Κελμωναί |
| data/02.Exodus.txt | 8:21 | 2 :: ἐὰν δὲ μὴ βούλῃ ἐξαποστἑλͅαι τὸν λαόν μου, ἰδοὺ ἐγὼ ἑπαποστἑλλω ἐπὶ σὲ καὶ ἐπὶ τοὺς θεράποντάς σου καὶ ἐπὶ τὸν λαόν σου καὶ ἐπὶ τοὺς οἴκους ὑμῶν κυνόμυιαν, καὶ πλησθήσονται αἱ οἰκίαι τῶν Αἰγυπτίω |
| data/02.Exodus.txt | 39:1 | 1 :: 1 Πᾶν τὸ χρυσίον ὃ κατειργάσθη εἰς τὰ ἔργα κατὰ πᾶσαν τὴν ἐργασίαν τῶν ἁγίων ἐγένετο χρυσίου τοῦ τῆς ἀπαρχῆς, ἐννέα καὶ εἴκοσι τάλαντα καὶ ἑπτακόσιοι εἴκοσι σίκλοι, κατὰ τὸν σίκλον τὸν ἅγιον. |
| data/08.Judices.txt | 18:8 | 13 / 1 / 2 / 3 / 4 / 5 / 6 / 7 :: καὶ ἦλθον οἱ πέντε ἄνδρες πρὸς τοὺς ἀδελφοὺς αὐτῶν εἰς Σαραὰ καὶ Ἐσθαόλ, καὶ εἶπον τοῖς ἀδελφοῖς αὐτῶν Tt 13 Μειχα Α \| αγαθυνει ἠγαθοποίησεν Α \| κύριος ἐμοὶ με κݲςݲ Α |
| data/15.Paralipomenon_I.txt | 16:10 | 10 :: 10 αἰνεῖτε ἐν ὀνόματι ἁγίῳ αὐτοῦ, εὐφρανθήσεται καρδία ζητοῦσα τὴν εὐδοκίαν αὐτοῦ. |
| data/20.Judith.txt | 6:12 | 13 :: καὶ ὡς ἴδαν αὐτοὺς οἱ ἄνδρες τῆς πόλεως ἐπὶ τὴν κορυφὴν τοῦ ὄρους, ἀνέλαβον τὰ ὅπλα αὐτῶν καὶ ἐπῆλθον ἔξω τῆς πόλεως ἐπὶ τὴν κορυφὴν τοῦ ὄρους· καὶ πᾶς ἀνὴρ σφενδονήτης διεκράτησαν τὴν ἀνάβασιν  |
| data/31.Canticum.txt | 1:3 | 3 :: ³καὶ ὀσμὴ μύρων σου ὑπέρ πάντα τὰ 3 ἀρώματα· μύρον ἐκκενωθὲν ὄνομά σου. διὰ τοῦτο νεάνιδες ἠγάπησάν σε, |
| data/32.Job.txt | 19:17 | 17 :: στόμα δέ μου ἐδέετο, 17 καὶ ἱκέτευον τὴν γυναῖκά μου, προσεκαλούμην δὲ κολακεύων υἱοὺς παλλακίδων μου· |
| data/33.Sapientia_Salomonis.txt | 11:8 | 8 :: ἔδωκας αὐτοῖς δαψιλὲς ὕδωρ ἀνελπίστως, 8 δείξας διὰ τοῦ τότε δίψους πῶς τοὺς ὑπεναντίους ἐκόλασας. |
| data/33.Sapientia_Salomonis.txt | 19:24 | 24 :: 24 ἐπὶ γὰρ ποδήρους ἐνδύματος ἦν ὅλος ὁ κόσμος. καὶ πατέρων δόξαι ἐπὶ τετραστίχου λίθου γλυφῆς, καὶ μεγαλωσύνη σου ἐπὶ διαδήματος κεφαλῆς αὐτοῦ. |

### editorial markers: 10

| File | Reference | Observed sample |
| --- | --- | --- |
| data/01.Genesis.txt | 41:48 | * :: καὶ συνήγαγεν πόντα τὰ βρώματα τῶν ἑπτὰ ἐτῶν ἐν οἶς ἢh ἡ εὐθηνία ἐν γῇ Αἰγύπτου, καὶ ἔθηκεν τὰ βρώματα ἐν ταῖς πόλεσιν. βρώματα τῶν πεδίων τῆς πόλεως πόλεως κύκλῳ αὐτῆς *Ων ἒθηκεν ἐν αὐτῇ. |
| data/02.Exodus.txt | 15:1 | * :: Τότε ᾖσεν Μωυσῆς καὶ οἱ υἱοὶ Ἰσραὴλ τὴν ᾠδὴν ταύτην τῷ θεῷ, καὶ εἶπαν λέγοντες * ᾌσωμεν τῷ κυρίῳ, ἐνδόξως γὰρ δεδόξασται· ἵππον καὶ ἀναβάτην ἔρριψεν εἰς θάλασσαν. |
| data/04.Numeri.txt | 24:23 | * :: καὶ ἰδὼν Ὤγ καὶ ἀναλαβὼν τὴν παραβολὴν αὐτοῦ εἶπεν *Ὤ ὤ, τίς ζήσεται ὅταν θῇ ταῦτα ὁ θεός; |
| data/05.Deuteronomium.txt | 31:29 | * :: οἶδα γὰρ ὅτι ἔσχατον τῆς τελευτῆς μου ἀνομίᾳ ἀνομήσετε, καὶ ἐκκλινεῖτε ἀπὸ τῆς ὁδοῦ ἧς ἐνετειλάμην ὑμῖν· τὰ κακὰ ἔσχατον τῶν ἡμερῶν, ὅτι ποιήσετε τὰ πονηρὰ ἐναντίον Κυρίου, παροργίσαι αὐτὸν ἐν το |
| data/08.Judices.txt | 18:8 | * :: καὶ ἦλθον οἱ πέντε ἄνδρες πρὸς τοὺς ἀδελφοὺς αὐτῶν εἰς Σαραὰ καὶ Ἐσθαόλ, καὶ εἶπον τοῖς ἀδελφοῖς αὐτῶν Tt 13 Μειχα Α \| αγαθυνει ἠγαθοποίησεν Α \| κύριος ἐμοὶ με κݲςݲ Α XVIII 1 εζητει η φ. του Δὰν  |
| data/10.Ruth.txt | 2:23 | * :: καὶ προσεκολλήθη ῾Ροὺθ τοῖς κορασίοις βοὸς συλλέγειν ἕως οὗ συνετέλεσεν τὸν θερισμὸν τῶν κριθῶν καὶ τῶν πυρῶν. * κοὶ ἐκάθισεν μετὰ τῆς πενθερᾶς αὐτῆς. |
| data/13.Regnorum_III.txt | 2:35a | * :: Καὶ ἔδωκεν Κύριος φρόνησιν τῷ Σαλωμὼν καὶ σοφίαν πολλὴν σφόδρα καὶ πλάτος καρδίας ὡς ἡ ἄμμος ἡ παρὰ τὴν θάλασσαν. * |
| data/20.Judith.txt | 8:1 | * :: Καὶ ἤκουσεν ἐν ἐκείναις ταῖς ἡμέραις Ἰουδεὶθ θυγάτηρ Μεραρεὶ υἱοῦ *Ωξ υἱοῦ Ἰωσὴφ υἱοῦ Ὀζειὴλ υἱοῦ Ἐλκειὰ υἱοῦ Ἠλειοὺ υἱοῦ Χελκείου υἱοῦ Ἐλιὰβ υἱοῦ Ναθαναὴλ υἱοῦ Σαλαμιὴλ υἱοῦ Σαρασαδαὶ υἱοῦ Ἰσραή |
| data/21.Tobias.txt | 7:1 | * :: Καὶ ἦλθεν εἰς Ἐκβάτανα *καὶ παρεγένετο εἰς τὴν οἰκίαν Ῥαγουήλ, καὶ Σάρρα δὲ ὑπήντησεν αὐτῷ· καὶ ἐχαιρέτισεν αὐτὸν καὶ αὐτὸς αὐτούς. καὶ εἰσήγαγεν αὐτοὺς εἰς τὴν οἰκίαν. |
| data/33.Sapientia_Salomonis.txt | 18:19 | * :: *ἢ κτύπος ἀπηνὴς καταριπτομένων πετρῶυ, ἡ σκιρτώνταον ζῴων δρόμος ἀθεώρητος, ἡ ὠρυομένων ἀπηνεστάτων θηρίων φωνή, ἢ ἀντανακλωμένη ἐκ κοιλότητος ὀρέων ἠχώ, παρέλυσεν αὐτοὺς ἐκφοβοῦντα. |

### uncertain glyph strings: 11

| File | Reference | Observed sample |
| --- | --- | --- |
| data/01.Genesis.txt | 43:23 | εἶ(??)εν δὲ αὐτοῖς ὁ ἄνθρωπος ἵλεως ὑμῖν, μὴ φοβεῖσθε· ὁ θεὸς ὑμῶν καὶ ὁ θεὸς τῶν πατέρων ὑμῶν ἒδωκεν ὑμῖν θησαυροὺς ἐν τοῖς μαρσίπποις ὑμῶν./ τὸ δὲ ἀργύριον ὑμῶν εὐδοκιμοῦν ἀπέχω. καὶ ἐξήγαγεν πρὸς α |
| data/04.Numeri.txt | 15:23 | καθὰ συνέταξενύριος Κύριος πρὸς ὑμᾶς ἐν χειρὶ (??) ἀπὸ τῆς ἡμέρας ἧς συνέταξεν κύριος πρὸς ὑμᾶς καὶ ἐπέεἰς τὰς γενεὰς ὑμῶν· |
| data/08.Judices.txt | 2:1 | καὶ ἀνέβη ἄγγελος κυρίου ἀπὸ Γαλγὰλ ἐπὶ τὸν κλαυθμῶνα καὶ ἐπὶ Βαιθὴλ καὶ ἐπὶ τὸν οἶκον Ἰσραήλ, καὶ εἶπεν πρὸς αὐτούς τάδε λέγει Κύος Ἀβεβίβασα ὑμᾶς ἐξ Αἰγύπτου, κοὶ εἰσήγαγον εἰς εἰς τὴν γῆν (??) ὤμοσ |
| data/13.Regnorum_III.txt | 3:4 | καὶ ἀνέστη καὶ ἐπορεύθη εἰς Γαβαὼν θῦσαι ἐκεῖ, ὅτι αὐτὴ ὑψηλοτάτη καὶ μ(??)γάλη· χιλίαν ολοκαύτωσιν ἀνήνεγκεν Σαλωμὼν ἐπὶ τὸ θυσιαστήριον ἐν Γαβαών. |
| data/20.Judith.txt | 16:16 | ¹6ὅτι μικρὸν πᾶσα θυσία εἰ ὀσμὴν εὐωδίας, καὶ ἐλάχιστον πᾶν ?? ?? εἰς ὁλοκαύτωμά σοι ὁ δὲ φοβούμενος τὸν ?? ?? μέγας διὰ παντός. |
| data/20.Judith.txt | 16:17 | ¹7οὐαὶ ἔθνεσιν ?? τῷ γένει μου· Κύριος Παντοκράτωρ ἐκδικήσει αὐτοὺς ἐν ἡμέρᾳ κρίσεως, (21)δοῦναι πῦρ καὶ σκώληκας εἰς σάρκας αὐτῶν, καὶ κλαύσονται ἐν αἰσθήσει ἕως αἰῶνος. |
| data/48.Isaias.txt | 29:12 | καὶ δοθήσεται τὸ βιβλίον τοῦτο εἷς χεῖρας ἀνθρώπου μὴ ἐπισταμένου γράμματα, καὶ ἐρεῖ αὐτῷ Ἀνάγνωθ(??) τοῦτο· καὶ ἐρεῖ Οὐκ ἐπίσταμαι γράμματα. |
| data/57.Daniel_Theodotionis_versio.txt | 3:52 | ⁵²Εὐλογητὸς εἶ, Κύριε ὁ θ??ὸς τῶν πατέρων ἡμῶν, καὶ αἰνετὸς καὶ ὑπερυψούμενος εἰς τοὺς αἰῶνας· καὶ εὐλογημένον τὸ ὄνομα τῆς δόξης σου τὸ ἅγιον, καὶ ὑπεραινετὸν καὶ ὑπερυψούμενον εἰς πάντας τοὺς αἰῶνας |

### apparatus notes: 0

No occurrences detected by this check.

### variant sigla / marginal notes: 0

No occurrences detected by this check.

### other XML notes: 0

No occurrences detected by this check.

### brackets: 0

No occurrences detected by this check.

### superscript / note marker candidates: 425

| File | Reference | Observed sample |
| --- | --- | --- |
| data/15.Paralipomenon_I.txt | 3:24 | ¹ :: καὶ υἱοὶ Ἐλειθενάν· ¹Οδολιὰ καὶ Ἀσεὶβ καὶ Φορὰ καὶ Ἰακοὺν καὶ Ἰωανάν καὶ Δαλααιὰ καὶ Μανεί, ἑπτά. |
| data/15.Paralipomenon_I.txt | 8:35 | ᵇ :: καὶ υἱοὶ Μιχιά· Φιθὼν καὶ Μελχὴλ καὶ ᵇερέε καὶ Ζάκ. |
| data/15.Paralipomenon_I.txt | 12:7 | ⁸ :: καὶ Ἐλιὰ καὶ Ζαβιδιὰ υἱοὶ Ῥαὰμ καὶ οἱ τοῦ Γεδώρ. ⁸καὶ ἀπὸ τοῦ Γεδδεὶ ἐχωρίσθησαν πρὸς Δαυεὶδ ἀπὸ τῆς ἐρήμου ἰσχυροὶ δυνατοὶ ἄνδρες παρατάξεως πολέμου, αἴροντες θυρεοὺς καὶ δόρατα, καὶ πρόσωπον λέ |
| data/15.Paralipomenon_I.txt | 16:11 | ¹ / ¹ :: ¹¹ζητήσατε καὶ ἰσχύσατε, ζητήσατε τὸ πρόσωπον αὐτοῦ διὰ παντός. |
| data/15.Paralipomenon_I.txt | 16:21 | ² / ¹ :: ²¹οὐκ ἀφῆκεν ἄνδρα τοῦ δυναστεῦσαι αὐτούς, καὶ ἤλεγξεν περὶ αὐτῶν βασιλεῖς |
| data/15.Paralipomenon_I.txt | 16:23 | ² / ³ :: ²³ἄσατε τῷ κυρίῳ πᾶσα ἡ γῆ, ἀναγγείλατε ἐξ ἡμέρας εἰς ἡμέραν σωτηρίαν αὐτοῦ. |
| data/15.Paralipomenon_I.txt | 16:31 | ³ / ¹ :: ³¹εὐφρανθήτω ὁ οὐρανὸς καὶ ἀγαλλιάσθω ἡ γῆ, καὶ εἰπάτωσαν ἐυ τοῖς ἔθνεσιν Κύριος βασιλεύων. |
| data/15.Paralipomenon_I.txt | 16:32 | ³ / ² :: ³²ββοββήσει ἡ θάλασσα σὺν τῷ πληρώματι· ξύλον ἀγροῦ καὶ πάντα τὰ ἐν αὐτῷ. |
| data/15.Paralipomenon_I.txt | 16:33 | ³ / ³ :: ³³τότε εὐφρανθήσεται τὰ ξύλα τοῦ δρυμοῦ ἀπὸ προσώπου Κυρίου, ὅτι ἥλθεν κρῖναι τὴν γῆν. |
| data/15.Paralipomenon_I.txt | 20:2 | ³ :: καὶ ἔλαβεν Δαυεὶδ τὸν στέφανον Μολχὸλ βασιλέως αὐτῶν ἀπὸ τῆς κεφαλῆς αὐτοῦ, καὶ εὑρέθη ὁ σταθμὸς αὐτοῦ τάλαντον χρυσίου, καὶ ἐν αὐτῷ λίθος τίμιος, καὶ ἦν ἐπὶ τὴν κεφαλὴν Δαυείδκαὶ σκῦλα τῆς πόλεω |

### literal Unicode escape labels: 12

| File | Reference | Observed sample |
| --- | --- | --- |
| data/26.Machabaeorum_iv.txt | 17:9 | U+03F2 / U+03F2 / U+03F2 / U+03F2 :: Ἐνταῦθα φέρων ἱερεύU+03F2, καὶ φυνὴ φεραιά, καὶ ἑπτὰ παῖδεU+03F2 ἐνκεκήδευνται διὰ τυράννου βίδν, τὴν Ἐβρδίων πολιτίαν καταλῦU+03F2αι θέλοντοU+03F2. |
| data/26.Machabaeorum_iv.txt | 17:10 | U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 :: οἳ καὶ ἐξεδίκηU+03F2αν τὸ ἔθνοU+03F2 εἰU+03F2 θεὸν ἀφορῶντεU+03F2, καὶ μέχρι θανάτου τὰU+03F2 βαU+03F2άνουU+03F2 ὑπομίναντεU+03 |

### replacement characters: 0

No occurrences detected by this check.

### control characters: 0

No occurrences detected by this check.

### XML leftovers in main text: 22

| File | Reference | Observed sample |
| --- | --- | --- |
| data/48.Isaias.txt | 7:3 | < υἱός > :: Καὶ εἶπεν Κύριος πρὸς Ἠσαίαν Ἔξελθε εἰς συνάντησιν Ἀχὰζ σὺ καὶ ὁ καταλειφθεὶς Ἰασσοὺβ ὁ < υἱός > σου πρὸς τὴν κολυμβήθραν τῆς ἄνω ὁδοῦ τοῦ ἀγροῦ τοῦ γναφέως. |
| data/48.Isaias.txt | 10:11 | < αὐτῆς, > :: ὃν τρόπον γὰρ ἐποίησα Σαμαρείᾳ καὶ τοῖς χειροποιήτοις < αὐτῆς, > οὕτως ποιήσω καὶ Ἰερουσαλὴμ καὶ τοῖς εἰδώλοις αὐτῆς. |
| data/48.Isaias.txt | 10:13 | < τῆ σοφίᾳ. τῆς συνέσεως > :: εἶπεν γὰρ Τῇ ἰσχύι ποιήσω, καὶ < τῆ σοφίᾳ. τῆς συνέσεως > ἀφελῶ ὅρια ἐθνῶν, καὶ τὴν προνομεύσω· |
| data/48.Isaias.txt | 10:34 | < καὶ πεσοῦνται ὑψηλοὶ > :: < καὶ πεσοῦνται ὑψηλοὶ > μαχαίρᾳ, ὁ δὲ Λίβανος σὺν τοῖς ὑψηλοῖς πεσεῖται. |
| data/48.Isaias.txt | 13:2 | < χειρί > :: Ἐπ᾿ ὅρους πεδινοῦ ἄρατε σημεῖον, υψώσατε τὴν φωνὴν ἑαυτοῖς, μὴ φοβεῖσθε · παρακαλεῖτε τῇ < χειρί > . ἀνοίξατε, οἱ ἄρχοντες. |
| data/48.Isaias.txt | 13:7 | < πᾶσα χεὶρ > :: διὰ τοῦτο < πᾶσα χεὶρ > ἐκλυθήσεται, καὶ πᾶσα ψυχὴ ἀνθρώπου δειλιάσει· |
| data/48.Isaias.txt | 14:23 | < βάραθρον > :: καὶ θήσω τὴν Βαβυλωνίαν ἔρημον, ὥστε κατοικεῖν ἐχίνους, καὶ ἔσται εἰς οὐδέν· καὶ θήσω αὐτὴν πηλοῦ < βάραθρον > εἰς ἀπώλειαν. |
| data/48.Isaias.txt | 15:4 | < Ἐλεαλή > :: ὅτι κέκραγεν Ἑσεβὼν καὶ < Ἐλεαλή > , ἕως ἠκούσθη ἡ φωνὴ αὐτῆς· διὰ τοῦτο ἡ ὀσφὺς τῆς Μωαβίτιδος βοᾷ, ἡ ψυχὴ αὐτῆς γνώσεται. |
| data/48.Isaias.txt | 16:9 | < Ἐλεαλή > :: διὰ τοῦτο κλαύσομαι ὡς τὸν κλαυθμὸν Ἰαζὴρ ἄμπελον Σεβαμά· τὰ δένδρα σου κατέβαλεν Ἑσεβὼν καὶ < Ἐλεαλή > , ἐπὶ τῷ θερισμῷ καὶ ἐπὶ τῷ τρυγητῷ σου καταπατήσω, καὶ πάντα πεσοῦνται. |
| data/48.Isaias.txt | 17:11 | < σπείρῃς > :: τῇ δὲ ἡμέρᾳ ᾖ ἂν φυτεύσῃς, πλανηθήσῃ· τὸ δὲ πρωὶ ἐὰν < σπείρῃς > , ἀνθήσει εἷς ἀμητόν ᾗ ἂν ἡμέρᾳ κληρώσῃ, καὶ ὥσπερ πατὴρ ἀνθρώπου κληρώσῃ τοῖς υἱοῖς. |

### hyphenated fragments: 0

No occurrences detected by this check.

### empty verses: 0

No occurrences detected by this check.

### placeholder verse candidates: 0

No occurrences detected by this check.

### unparsed token rows: 0

No occurrences detected by this check.

### invalid XML: 0

No occurrences detected by this check.

### nonstandard / zero references: 358

| File | Reference | Observed sample |
| --- | --- | --- |
| data/06.Josue.txt | 15:59a | Θεκὼ καὶ Ἐφράθα, αὕτη ἐστὶν καὶ Φαγὼρ καὶ Αἰτὰν καὶ Κουλὸν καὶ Τατὰμ καὶ Ἐωβὴς καὶ Καρὲμ Γαλὲμ καὶ Θεθὴρ καὶ Μανοχώ, πόλεις ἕνδεκα καὶ αἱ κῶμαι αὐτ’ |
| data/06.Josue.txt | 19:48a | καὶ οὐκ ἐξέθλιψαν οἱ υἱοὶ Δὰν τὸν Ἀμορραῖον τὸν θλίβοντα αὐτοὺς ἐν τῷ ὄρει· καὶ οὐκ εἴων αὐτοὺς οἱ Ἀμορραῖοι καταβῆναι εἰς τὴν κοιλάδα, καὶ ἔθλιψαν ἀπ’ αὐτῶν τὸ ὅριον τῆς μερίδος αὐτῶν. |
| data/06.Josue.txt | 19:47a | καὶ ὁ Ἀμορραῖος ὑπέμεινεν τοῦ κατοικεῖν ἐν Ἐλὼμ καὶ ἐν Σαλαμείν· καὶ ἐβαρύνθη ἡ χεὶρ τοῦ Ἐφράιμ ἐπ’ αὐτούς, καὶ ἐγένοντο αὐτοῖς εἰς φόρον. |
| data/06.Josue.txt | 21:42a | και συνετέλεσεν Ἰησοῦς διαμερίσας τὴν γῆν ἐν τοῖς ὁρίοις αὐτῶν. |
| data/06.Josue.txt | 21:42b | καὶ ἔδωκαν οἱ υἱοὶ Ἰσραὴλ μερίδα τῷ Ἰησοῖ κατὰ πρόσταγμα κυρίου· ἔδωκαν αὐτῷ τὴν πόλιν ἢν ᾐτήσατο· τὴν Θαμ’. νασάραχ ἔδωκαν αὐτῷ ἐν τῷ ὄρει Ἐφράιμ. |
| data/06.Josue.txt | 21:42c | καὶ ᾠκοδόμησεν Ἰησοῦς τὴν πόλιν καὶ ᾤκησεν ἐν αὐτῇ· |
| data/06.Josue.txt | 21:42d | καὶ ἔλαβεν Ἰησοῦς τὰς μαχαίρας τὰς πετρίνας, ἐν αἷς περιέτεμεν τοὺς υἱούς Ἰσραὴλ τοὺς γενομένους ἐν τῇ ὁδῷ ἐν τῇ ἐρήμῳ, καὶ ἔθηκεν αὐτὰς ἐν Θαμνασαχαράθ. |
| data/06.Josue.txt | 24:30a | ἐκεῖ ἔθηκαν μετ’ αὐτοῦ εἰς τὸ μνῆμα, εἰς ὃ ἔθαψαν αὐτὸν ἐκεῖ, τἀς μαχαίρας τὰς πετρίνας ἐν αἷς περιέτεμεν τούς υἱοὺς Ἰσραὴλ ἐν Γαλγάλοις, ὅτε ἐξήγαγεν αὐτοὺς ἐξ Αἰγύπτου καθὰ συνέταξεν αὐτοῖς κύριος·  |
| data/06.Josue.txt | 24:33a | ἐν ἐκείνη τῆ ἡμέρᾳ λαβόντες οἱ υἱοὶ Ἰσραὴλ τὴν κιβωτὸν τοῦ θεοῦ περιεφέροσαν ἐν ἑαυτοῖς· καὶ Φεινεὲς ἱεράτευσεν ἀντὶ Ἐλεαζὰρ τοῦ πατρὸς αὐτοῦ ἕως ἀπέθανεν, καὶ κατωρύγη ἐν Γαβαὰρ τῇ ἑαυτῶν. |
| data/06.Josue.txt | 24:33b | b οἱ δὲ υἱοὶ Ἰσραὴλ ἀπήλθοσαν ἕκαστος εἰς τὸν τόπον αὐτῶν καὶ εἰς τήν ἑαυτῶν πόλιν. καὶ ἐσέβοντο οἱ υἱοὶ Ἰσραὴλ τὴν Ἀστάρτην καὶ Ἀσταρὼθ καὶ τοὺς θεοὺς τῶν ἐθνῶν τῶν κύκλω αὐτῶν· καὶ παρέδωκεν αὐτοὺς  |

## A structure versus canon, grouped by cause


### a Psalms


PSA — data/27.Psalmi.txt; chapters 151 vs canon 150. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 6 | 6 | 6 |  |  |
| 2 | 2 | 12 | 12 | 12 |  |  |
| 3 | 3 | 9 | 9 | 8 |  |  |
| 4 | 4 | 9 | 9 | 8 |  |  |
| 5 | 5 | 13 | 13 | 12 |  |  |
| 6 | 6 | 11 | 11 | 10 |  |  |
| 7 | 7 | 18 | 18 | 17 |  |  |
| 8 | 8 | 10 | 10 | 9 |  |  |
| 9 | 9 | 39 | 39 | 20 |  |  |
| 10 | 10 | 7 | 7 | 18 |  |  |
| 11 | 11 | 9 | 9 | 7 |  |  |
| 12 | 12 | 6 | 6 | 8 |  |  |
| 13 | 13 | 7 | 7 | 6 |  |  |
| 14 | 14 | 6 | 7 | 7 | 6 |  |
| 15 | 15 | 11 | 11 | 5 |  |  |
| 16 | 16 | 15 | 15 | 11 |  |  |
| 17 | 17 | 51 | 51 | 15 |  |  |
| 18 | 18 | 15 | 15 | 50 |  |  |
| 19 | 19 | 10 | 10 | 14 |  |  |
| 20 | 20 | 14 | 14 | 9 |  |  |
| 21 | 21 | 32 | 32 | 13 |  |  |
| 22 | 22 | 7 | 32 | 31 | 7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31 |  |
| 23 | 23 | 10 | 10 | 6 |  |  |
| 24 | 24 | 21 | 22 | 10 | 14 |  |
| 25 | 25 | 13 | 22 | 22 | 13,14,15,16,17,18,19,20,21 |  |
| 26 | 26 | 14 | 14 | 12 |  |  |
| 27 | 27 | 10 | 14 | 14 | 10,11,12,13 |  |
| 28 | 28 | 11 | 11 | 9 |  |  |
| 29 | 29 | 13 | 13 | 11 |  |  |
| 30 | 30 | 25 | 25 | 12 |  |  |
| 31 | 31 | 12 | 25 | 24 | 12,13,14,15,16,17,18,19,20,21,22,23,24 |  |
| 32 | 32 | 22 | 22 | 11 |  |  |
| 33 | 33 | 23 | 23 | 22 |  |  |
| 34 | 34 | 28 | 28 | 22 |  |  |
| 35 | 35 | 13 | 13 | 28 |  |  |
| 36 | 36 | 40 | 40 | 12 |  |  |
| 37 | 37 | 23 | 23 | 40 |  |  |
| 38 | 38 | 14 | 14 | 22 |  |  |
| 39 | 39 | 18 | 18 | 13 |  |  |
| 40 | 40 | 14 | 14 | 17 |  |  |
| 41 | 41 | 12 | 12 | 13 |  |  |
| 42 | 42 | 6 | 12 | 11 | 6,7,8,9,10,11 |  |
| 43 | 43 | 26 | 27 | 5 | 8 |  |
| 44 | 44 | 18 | 18 | 26 |  |  |
| 45 | 45 | 12 | 12 | 17 |  |  |
| 46 | 46 | 10 | 10 | 11 |  |  |
| 47 | 47 | 14 | 15 | 9 | 7 |  |
| 48 | 48 | 21 | 21 | 14 |  |  |
| 49 | 49 | 23 | 23 | 20 |  |  |
| 50 | 50 | 21 | 21 | 23 |  |  |
| 51 | 51 | 11 | 11 | 19 |  |  |
| 52 | 52 | 7 | 7 | 9 |  |  |
| 53 | 53 | 9 | 9 | 6 |  |  |
| 54 | 54 | 23 | 24 | 7 | 6 |  |
| 55 | 55 | 14 | 14 | 23 |  |  |
| 56 | 56 | 12 | 12 | 13 |  |  |
| 57 | 57 | 12 | 12 | 11 |  |  |
| 58 | 58 | 18 | 18 | 11 |  |  |
| 59 | 59 | 14 | 14 | 17 |  |  |
| 60 | 60 | 9 | 9 | 12 |  |  |
| 61 | 61 | 13 | 13 | 8 |  |  |
| 62 | 62 | 12 | 12 | 12 |  |  |
| 63 | 63 | 10 | 11 | 11 | 3 |  |
| 64 | 64 | 14 | 14 | 10 |  |  |
| 65 | 65 | 20 | 20 | 13 |  |  |
| 66 | 66 | 8 | 8 | 20 |  |  |
| 67 | 67 | 36 | 36 | 7 |  |  |
| 68 | 68 | 37 | 37 | 35 |  |  |
| 69 | 69 | 6 | 6 | 36 |  |  |
| 70 | 70 | 24 | 24 | 5 |  |  |
| 71 | 71 | 21 | 24 | 24 | 21,22,23 |  |
| 72 | 72 | 28 | 28 | 20 |  |  |
| 73 | 73 | 24 | 28 | 28 | 24,25,26,27 |  |
| 74 | 74 | 11 | 11 | 23 |  |  |
| 75 | 75 | 13 | 13 | 10 |  |  |
| 76 | 76 | 21 | 21 | 12 |  |  |
| 77 | 77 | 72 | 72 | 20 |  |  |
| 78 | 78 | 14 | 72 | 72 | 14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71 |  |
| 79 | 79 | 20 | 20 | 13 |  |  |
| 80 | 80 | 17 | 17 | 19 |  |  |
| 81 | 81 | 9 | 17 | 16 | 9,10,11,12,13,14,15,16 |  |
| 82 | 82 | 19 | 19 | 8 |  |  |
| 83 | 83 | 13 | 13 | 18 |  |  |
| 84 | 84 | 14 | 14 | 12 |  |  |
| 85 | 85 | 17 | 17 | 13 |  |  |
| 86 | 86 | 8 | 17 | 17 | 8,9,10,11,12,13,14,15,16 |  |
| 87 | 87 | 19 | 19 | 7 |  |  |
| 88 | 88 | 53 | 84 | 18 | 48,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83 |  |
| 89 | 89 | 18 | 53 | 52 | 18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52 |  |
| 90 | 90 | 17 | 17 | 17 |  |  |
| 91 | 91 | 15 | 15 | 16 |  |  |
| 92 | 92 | 6 | 15 | 15 | 6,7,8,9,10,11,12,13,14 |  |
| 93 | 93 | 23 | 23 | 5 |  |  |
| 94 | 94 | 12 | 23 | 23 | 12,13,14,15,16,17,18,19,20,21,22 |  |
| 95 | 95 | 13 | 13 | 11 |  |  |
| 96 | 96 | 13 | 13 | 13 |  |  |
| 97 | 97 | 10 | 12 | 12 | 10,11 |  |
| 98 | 98 | 9 | 9 | 9 |  |  |
| 99 | 99 | 6 | 9 | 9 | 6,7,8 |  |
| 100 | 100 | 8 | 8 | 5 |  |  |
| 101 | 101 | 29 | 29 | 8 |  |  |
| 102 | 102 | 23 | 29 | 28 | 23,24,25,26,27,28 |  |
| 103 | 103 | 35 | 35 | 22 |  |  |
| 104 | 104 | 45 | 45 | 35 |  |  |
| 105 | 105 | 48 | 48 | 45 |  |  |
| 106 | 106 | 43 | 43 | 48 |  |  |
| 107 | 107 | 14 | 14 | 43 |  |  |
| 108 | 108 | 31 | 31 | 13 |  |  |
| 109 | 109 | 8 | 31 | 31 | 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30 |  |
| 110 | 110 | 10 | 10 | 7 |  |  |
| 111 | 111 | 10 | 10 | 10 |  |  |
| 112 | 112 | 10 | 10 | 10 |  |  |
| 113 | 113 | 26 | 26 | 9 |  |  |
| 114 | 114 | 10 | 26 | 8 | 10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25 |  |
| 115 | 115 | 9 | 10 | 18 | 6 |  |
| 116 | 116 | 3 | 10 | 19 | 3,4,5,6,7,8,9 |  |
| 117 | 117 | 28 | 29 | 2 | 4 |  |
| 118 | 118 | 167 | 176 | 29 | 19,28,30,32,34,35,51,131,133 |  |
| 119 | 119 | 7 | 176 | 176 | 4,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175 |  |
| 120 | 120 | 8 | 8 | 7 |  |  |
| 121 | 121 | 9 | 9 | 8 |  |  |
| 122 | 122 | 5 | 9 | 9 | 5,6,7,8 |  |
| 123 | 123 | 8 | 8 | 4 |  |  |
| 124 | 124 | 6 | 8 | 8 | 6,7 |  |
| 125 | 125 | 6 | 6 | 5 |  |  |
| 126 | 126 | 6 | 6 | 6 |  |  |
| 127 | 127 | 6 | 6 | 5 |  |  |
| 128 | 128 | 8 | 8 | 6 |  |  |
| 129 | 129 | 8 | 8 | 8 |  |  |
| 130 | 130 | 4 | 8 | 8 | 4,5,6,7 |  |
| 131 | 131 | 18 | 18 | 3 |  |  |
| 132 | 132 | 4 | 18 | 18 | 4,5,6,7,8,9,10,11,12,13,14,15,16,17 |  |
| 133 | 133 | 3 | 3 | 3 |  |  |
| 134 | 134 | 21 | 21 | 3 |  |  |
| 135 | 135 | 25 | 26 | 21 | 23 |  |
| 136 | 136 | 10 | 26 | 26 | 10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25 |  |
| 137 | 137 | 9 | 9 | 9 |  |  |
| 138 | 138 | 24 | 24 | 8 |  |  |
| 139 | 139 | 14 | 14 | 24 |  |  |
| 140 | 140 | 11 | 14 | 13 | 11,12,13 |  |
| 141 | 141 | 8 | 8 | 10 |  |  |
| 142 | 142 | 12 | 12 | 7 |  |  |
| 143 | 143 | 15 | 15 | 12 |  |  |
| 144 | 144 | 21 | 21 | 15 |  |  |
| 145 | 145 | 11 | 21 | 21 | 11,12,13,14,15,16,17,18,19,20 |  |
| 146 | 146 | 11 | 11 | 10 |  |  |
| 147 | 147 | 10 | 11 | 20 | 10 |  |
| 148 | 148 | 14 | 14 | 14 |  |  |
| 149 | 149 | 10 | 14 | 9 | 10,11,12,13 |  |
| 150 | 150 | 7 | 9 | 6 | 7,8 |  |
| 151 | 151 | 7 | 7 | absent |  |  |

### b Jeremiah


JER — data/49.Jeremias.txt; chapters 52 vs canon 52. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 19 | 19 | 19 |  |  |
| 2 | 2 | 34 | 36 | 37 | 1,6 |  |
| 3 | 3 | 25 | 25 | 25 |  |  |
| 4 | 4 | 31 | 31 | 31 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 32 | 34 | 34 | 1,27 |  |
| 8 | 8 | 20 | 22 | 22 | 11,12 |  |
| 9 | 9 | 26 | 26 | 26 |  |  |
| 10 | 10 | 20 | 25 | 25 | 5,6,7,8,10 | 5a,5b |
| 11 | 11 | 22 | 23 | 23 | 7 |  |
| 12 | 12 | 17 | 17 | 17 |  |  |
| 13 | 13 | 27 | 27 | 27 |  |  |
| 14 | 14 | 22 | 22 | 22 |  |  |
| 15 | 15 | 21 | 21 | 21 |  |  |
| 16 | 16 | 21 | 21 | 21 |  |  |
| 17 | 17 | 23 | 27 | 27 | 1,2,3,4 |  |
| 18 | 18 | 23 | 23 | 23 |  |  |
| 19 | 19 | 15 | 15 | 15 |  |  |
| 20 | 20 | 18 | 18 | 18 |  |  |
| 21 | 21 | 14 | 14 | 14 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 38 | 40 | 40 | 30,31 |  |
| 24 | 24 | 10 | 10 | 10 |  |  |
| 25 | 25 | 19 | 19 | 38 |  |  |
| 26 | 26 | 26 | 28 | 24 | 7,26 |  |
| 27 | 27 | 46 | 46 | 22 |  |  |
| 28 | 28 | 60 | 64 | 17 | 45,46,47,48 |  |
| 29 | 29 | 23 | 23 | 32 |  |  |
| 30 | 30 | 16 | 16 | 24 |  |  |
| 31 | 31 | 44 | 44 | 40 |  |  |
| 32 | 32 | 24 | 24 | 44 |  |  |
| 33 | 33 | 24 | 24 | 26 |  |  |
| 34 | 34 | 18 | 18 | 22 |  |  |
| 35 | 35 | 17 | 17 | 19 |  |  |
| 36 | 36 | 27 | 32 | 32 | 16,17,18,19,20 |  |
| 37 | 37 | 20 | 24 | 21 | 10,11,15,22 |  |
| 38 | 38 | 40 | 40 | 28 |  |  |
| 39 | 39 | 44 | 44 | 18 |  |  |
| 40 | 40 | 13 | 13 | 16 |  |  |
| 41 | 41 | 22 | 22 | 18 |  |  |
| 42 | 42 | 19 | 19 | 22 |  |  |
| 43 | 43 | 32 | 32 | 13 |  |  |
| 44 | 44 | 21 | 21 | 30 |  |  |
| 45 | 45 | 28 | 28 | 5 |  |  |
| 46 | 46 | 8 | 18 | 28 | 4,5,6,7,8,9,10,11,12,13 |  |
| 47 | 47 | 16 | 16 | 7 |  |  |
| 48 | 48 | 17 | 18 | 47 | 11 | 11s |
| 49 | 49 | 22 | 22 | 39 |  |  |
| 50 | 50 | 13 | 13 | 46 |  |  |
| 51 | 51 | 35 | 35 | 64 |  |  |
| 52 | 52 | 27 | 34 | 34 | 2,3,9,15,28,29,30 |  |

### c Esther/Daniel


EST — data/19.Esther.txt; chapters 10 vs canon 10. Nonpositive/nonnumeric chapters: [{"chapter":"prologue","count":17,"max":17,"nonstandard":[],"holes":[]}]

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 15 | 15 | 15 |  | 1a,2a,3a,4a,5a,6a,7a |
| 4 | 4 | 16 | 17 | 46 | 6 | 1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,1a1,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a,25a,26a,27a,28a,29a,30a,1b,2b,3b,4b,5b,6b,7b,8b,9b,10b,11b,12b,13b,14b,15b,16b |
| 5 | 5 | 12 | 14 | 14 | 1,2 |  |
| 6 | 6 | 13 | 13 | 14 |  |  |
| 7 | 7 | 10 | 10 | 10 |  |  |
| 8 | 8 | 17 | 17 | 17 |  | 1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,11a,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a |
| 9 | 9 | 30 | 31 | 32 | 5 |  |
| 10 | 10 | 11 | 11 | 14 |  | 1a,2a,3a |

DAN — data/56.Daniel_translatio_Graeca.txt; chapters 12 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 49 | 49 | 49 |  |  |
| 3 | 3 | 100 | 100 | 97 |  |  |
| 4 | 4 | 28 | 34 | 37 | 3,4,5,6,31,32 | 14a,30a,30b,30c,34a,34b,34c |
| 5 | 5 | 22 | 31 | 31 | 14,15,18,19,20,21,22,24,25 |  |
| 6 | 6 | 27 | 28 | 28 | 8 | 12a |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 27 | 27 | 27 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 21 | 21 | 21 |  |  |
| 11 | 11 | 45 | 45 | 45 |  |  |
| 12 | 12 | 13 | 13 | 13 |  |  |

DAN — data/57.Daniel_Theodotionis_versio.txt; chapters 12 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 49 | 49 | 49 |  |  |
| 3 | 3 | 98 | 100 | 97 | 71,72 |  |
| 4 | 4 | 34 | 34 | 37 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 28 | 28 | 28 |  |  |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 27 | 27 | 27 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 20 | 21 | 21 | 8 |  |
| 11 | 11 | 45 | 45 | 45 |  |  |
| 12 | 12 | 4 | 4 | 13 |  |  |

### d other


GEN — data/01.Genesis.txt; chapters 50 vs canon 50. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 31 | 31 | 31 |  |  |
| 2 | 2 | 24 | 24 | 25 |  |  |
| 3 | 3 | 24 | 24 | 24 |  |  |
| 4 | 4 | 26 | 26 | 26 |  |  |
| 5 | 5 | 31 | 31 | 32 |  |  |
| 6 | 6 | 22 | 22 | 22 |  |  |
| 7 | 7 | 24 | 24 | 24 |  |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 32 | 32 | 32 |  |  |
| 11 | 11 | 32 | 32 | 32 |  |  |
| 12 | 12 | 20 | 20 | 20 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 24 | 24 | 24 |  |  |
| 15 | 15 | 18 | 18 | 21 |  |  |
| 16 | 16 | 15 | 15 | 16 |  |  |
| 17 | 17 | 27 | 27 | 27 |  |  |
| 18 | 18 | 33 | 33 | 33 |  |  |
| 19 | 19 | 38 | 38 | 38 |  |  |
| 20 | 20 | 18 | 18 | 18 |  |  |
| 21 | 21 | 34 | 34 | 34 |  |  |
| 22 | 22 | 24 | 24 | 24 |  |  |
| 23 | 23 | 20 | 20 | 20 |  |  |
| 24 | 24 | 67 | 67 | 67 |  |  |
| 25 | 25 | 34 | 34 | 34 |  |  |
| 26 | 26 | 35 | 35 | 35 |  |  |
| 27 | 27 | 46 | 46 | 46 |  |  |
| 28 | 28 | 22 | 22 | 22 |  |  |
| 29 | 29 | 35 | 35 | 35 |  |  |
| 30 | 30 | 43 | 43 | 43 |  |  |
| 31 | 31 | 54 | 55 | 55 | 51 |  |
| 32 | 32 | 32 | 32 | 32 |  |  |
| 33 | 33 | 20 | 20 | 20 |  |  |
| 34 | 34 | 31 | 31 | 31 |  |  |
| 35 | 35 | 29 | 29 | 29 |  |  |
| 36 | 36 | 42 | 42 | 43 |  |  |
| 37 | 37 | 35 | 35 | 36 |  |  |
| 38 | 38 | 30 | 30 | 30 |  |  |
| 39 | 39 | 23 | 23 | 23 |  |  |
| 40 | 40 | 23 | 23 | 23 |  |  |
| 41 | 41 | 57 | 57 | 57 |  |  |
| 42 | 42 | 38 | 38 | 38 |  |  |
| 43 | 43 | 34 | 34 | 34 |  |  |
| 44 | 44 | 34 | 34 | 34 |  |  |
| 45 | 45 | 27 | 27 | 28 |  |  |
| 46 | 46 | 34 | 34 | 34 |  |  |
| 47 | 47 | 31 | 31 | 31 |  |  |
| 48 | 48 | 22 | 22 | 22 |  |  |
| 49 | 49 | 33 | 33 | 33 |  |  |
| 50 | 50 | 26 | 26 | 26 |  |  |

EXO — data/02.Exodus.txt; chapters 40 vs canon 40. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 25 | 25 | 25 |  |  |
| 3 | 3 | 22 | 22 | 22 |  |  |
| 4 | 4 | 30 | 31 | 31 | 26 |  |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 32 | 32 | 32 |  |  |
| 9 | 9 | 35 | 35 | 35 |  |  |
| 10 | 10 | 29 | 29 | 29 |  |  |
| 11 | 11 | 10 | 10 | 10 |  |  |
| 12 | 12 | 51 | 51 | 51 |  |  |
| 13 | 13 | 22 | 22 | 22 |  |  |
| 14 | 14 | 31 | 31 | 31 |  |  |
| 15 | 15 | 27 | 27 | 27 |  |  |
| 16 | 16 | 36 | 36 | 36 |  |  |
| 17 | 17 | 12 | 12 | 16 |  |  |
| 18 | 18 | 27 | 27 | 27 |  |  |
| 19 | 19 | 25 | 25 | 25 |  |  |
| 20 | 20 | 26 | 26 | 26 |  |  |
| 21 | 21 | 36 | 36 | 36 |  |  |
| 22 | 22 | 31 | 31 | 31 |  |  |
| 23 | 23 | 33 | 33 | 33 |  |  |
| 24 | 24 | 12 | 12 | 18 |  |  |
| 25 | 25 | 39 | 39 | 40 |  |  |
| 26 | 26 | 37 | 37 | 37 |  |  |
| 27 | 27 | 21 | 21 | 21 |  |  |
| 28 | 28 | 39 | 39 | 43 |  |  |
| 29 | 29 | 45 | 45 | 46 |  |  |
| 30 | 30 | 38 | 38 | 38 |  |  |
| 31 | 31 | 18 | 18 | 18 |  |  |
| 32 | 32 | 35 | 35 | 35 |  |  |
| 33 | 33 | 23 | 23 | 23 |  |  |
| 34 | 34 | 35 | 35 | 35 |  |  |
| 35 | 35 | 35 | 35 | 35 |  |  |
| 36 | 36 | 40 | 40 | 38 |  |  |
| 37 | 37 | 21 | 21 | 29 |  |  |
| 38 | 38 | 27 | 27 | 31 |  |  |
| 39 | 39 | 23 | 23 | 43 |  |  |
| 40 | 40 | 32 | 32 | 38 |  |  |

LEV — data/03.Leviticus.txt; chapters 27 vs canon 27. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 16 | 16 | 16 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 35 | 35 | 35 |  |  |
| 5 | 5 | 19 | 19 | 19 |  |  |
| 6 | 6 | 40 | 40 | 30 |  |  |
| 7 | 7 | 27 | 27 | 38 |  |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 24 | 24 | 24 |  |  |
| 10 | 10 | 20 | 20 | 20 |  |  |
| 11 | 11 | 47 | 47 | 47 |  |  |
| 12 | 12 | 8 | 8 | 8 |  |  |
| 13 | 13 | 59 | 59 | 59 |  |  |
| 14 | 14 | 57 | 57 | 57 |  |  |
| 15 | 15 | 33 | 33 | 33 |  |  |
| 16 | 16 | 34 | 34 | 34 |  |  |
| 17 | 17 | 16 | 16 | 16 |  |  |
| 18 | 18 | 30 | 30 | 30 |  |  |
| 19 | 19 | 37 | 37 | 37 |  |  |
| 20 | 20 | 27 | 27 | 27 |  |  |
| 21 | 21 | 24 | 24 | 24 |  |  |
| 22 | 22 | 33 | 33 | 33 |  |  |
| 23 | 23 | 44 | 44 | 44 |  |  |
| 24 | 24 | 23 | 23 | 23 |  |  |
| 25 | 25 | 55 | 55 | 55 |  |  |
| 26 | 26 | 46 | 46 | 46 |  |  |
| 27 | 27 | 34 | 34 | 34 |  |  |

NUM — data/04.Numeri.txt; chapters 36 vs canon 36. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 54 | 54 | 54 |  |  |
| 2 | 2 | 34 | 34 | 34 |  |  |
| 3 | 3 | 51 | 51 | 51 |  |  |
| 4 | 4 | 49 | 49 | 49 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 27 | 27 | 27 |  |  |
| 7 | 7 | 89 | 89 | 89 |  |  |
| 8 | 8 | 26 | 26 | 26 |  |  |
| 9 | 9 | 23 | 23 | 23 |  |  |
| 10 | 10 | 36 | 36 | 36 |  |  |
| 11 | 11 | 35 | 35 | 35 |  |  |
| 12 | 12 | 15 | 15 | 16 |  |  |
| 13 | 13 | 34 | 34 | 33 |  |  |
| 14 | 14 | 45 | 45 | 45 |  |  |
| 15 | 15 | 41 | 41 | 41 |  |  |
| 16 | 16 | 50 | 50 | 50 |  |  |
| 17 | 17 | 13 | 13 | 13 |  |  |
| 18 | 18 | 32 | 32 | 32 |  |  |
| 19 | 19 | 22 | 22 | 22 |  |  |
| 20 | 20 | 29 | 29 | 29 |  |  |
| 21 | 21 | 34 | 34 | 35 |  |  |
| 22 | 22 | 41 | 41 | 41 |  |  |
| 23 | 23 | 30 | 30 | 30 |  |  |
| 24 | 24 | 25 | 25 | 25 |  |  |
| 25 | 25 | 18 | 18 | 18 |  |  |
| 26 | 26 | 65 | 65 | 65 |  |  |
| 27 | 27 | 22 | 22 | 23 |  |  |
| 28 | 28 | 31 | 31 | 31 |  |  |
| 29 | 29 | 39 | 39 | 40 |  |  |
| 30 | 30 | 16 | 16 | 16 |  |  |
| 31 | 31 | 54 | 54 | 54 |  |  |
| 32 | 32 | 42 | 42 | 42 |  |  |
| 33 | 33 | 56 | 56 | 56 |  |  |
| 34 | 34 | 29 | 29 | 29 |  |  |
| 35 | 35 | 34 | 34 | 34 |  |  |
| 36 | 36 | 13 | 13 | 13 |  |  |

DEU — data/05.Deuteronomium.txt; chapters 34 vs canon 34. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 46 | 46 | 46 |  |  |
| 2 | 2 | 37 | 37 | 37 |  |  |
| 3 | 3 | 29 | 29 | 29 |  |  |
| 4 | 4 | 49 | 49 | 49 |  |  |
| 5 | 5 | 33 | 33 | 33 |  |  |
| 6 | 6 | 25 | 25 | 25 |  |  |
| 7 | 7 | 26 | 26 | 26 |  |  |
| 8 | 8 | 20 | 20 | 20 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 22 | 22 | 22 |  |  |
| 11 | 11 | 32 | 32 | 32 |  |  |
| 12 | 12 | 32 | 32 | 32 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 28 | 28 | 29 |  |  |
| 15 | 15 | 23 | 23 | 23 |  |  |
| 16 | 16 | 21 | 21 | 22 |  |  |
| 17 | 17 | 20 | 20 | 20 |  |  |
| 18 | 18 | 19 | 19 | 22 |  |  |
| 19 | 19 | 21 | 21 | 21 |  |  |
| 20 | 20 | 20 | 20 | 20 |  |  |
| 21 | 21 | 21 | 21 | 23 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 23 | 25 | 25 | 2,12 |  |
| 24 | 24 | 22 | 22 | 22 |  |  |
| 25 | 25 | 17 | 18 | 19 | 16 |  |
| 26 | 26 | 19 | 19 | 19 |  |  |
| 27 | 27 | 26 | 26 | 26 |  |  |
| 28 | 28 | 68 | 68 | 68 |  |  |
| 29 | 29 | 29 | 29 | 29 |  |  |
| 30 | 30 | 20 | 20 | 20 |  |  |
| 31 | 31 | 29 | 29 | 30 |  |  |
| 32 | 32 | 52 | 52 | 52 |  |  |
| 33 | 33 | 29 | 29 | 29 |  |  |
| 34 | 34 | 12 | 12 | 12 |  |  |

JOS — data/06.Josue.txt; chapters 24 vs canon 24. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  |  |
| 2 | 2 | 24 | 24 | 24 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 27 | 27 | 27 |  |  |
| 7 | 7 | 26 | 26 | 26 |  |  |
| 8 | 8 | 27 | 29 | 35 | 13,26 |  |
| 9 | 9 | 33 | 33 | 27 |  |  |
| 10 | 10 | 42 | 42 | 43 |  |  |
| 11 | 11 | 23 | 23 | 23 |  |  |
| 12 | 12 | 24 | 24 | 24 |  |  |
| 13 | 13 | 32 | 32 | 33 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |
| 15 | 15 | 63 | 63 | 63 |  | 59a |
| 16 | 16 | 10 | 10 | 10 |  |  |
| 17 | 17 | 18 | 18 | 18 |  |  |
| 18 | 18 | 28 | 28 | 28 |  |  |
| 19 | 19 | 51 | 51 | 51 |  | 48a,47a |
| 20 | 20 | 6 | 9 | 9 | 4,5,6 |  |
| 21 | 21 | 45 | 45 | 45 |  | 42a,42b,42c,42d |
| 22 | 22 | 34 | 34 | 34 |  |  |
| 23 | 23 | 16 | 16 | 16 |  |  |
| 24 | 24 | 33 | 33 | 33 |  | 30a,33a,33b |

JDG — data/08.Judices.txt; chapters 21 vs canon 21. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 36 | 36 | 36 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 31 | 31 | 31 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 40 | 40 | 40 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 35 | 35 | 35 |  |  |
| 9 | 9 | 57 | 57 | 57 |  |  |
| 10 | 10 | 18 | 18 | 18 |  |  |
| 11 | 11 | 40 | 40 | 40 |  |  |
| 12 | 12 | 15 | 15 | 15 |  |  |
| 13 | 13 | 25 | 25 | 25 |  |  |
| 14 | 14 | 20 | 20 | 20 |  |  |
| 15 | 15 | 20 | 20 | 20 |  |  |
| 16 | 16 | 31 | 31 | 31 |  |  |
| 17 | 17 | 13 | 13 | 13 |  |  |
| 18 | 18 | 31 | 31 | 31 |  |  |
| 19 | 19 | 30 | 30 | 30 |  |  |
| 20 | 20 | 48 | 48 | 48 |  |  |
| 21 | 21 | 25 | 25 | 25 |  |  |

RUT — data/10.Ruth.txt; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 18 | 18 | 18 |  |  |
| 4 | 4 | 22 | 22 | 22 |  |  |

1SA — data/11.Regnorum_I.txt; chapters 31 vs canon 31. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 28 | 28 | 28 |  |  |
| 2 | 2 | 36 | 36 | 36 |  |  |
| 3 | 3 | 21 | 21 | 21 |  |  |
| 4 | 4 | 21 | 21 | 22 |  |  |
| 5 | 5 | 12 | 12 | 12 |  |  |
| 6 | 6 | 21 | 21 | 21 |  |  |
| 7 | 7 | 17 | 17 | 17 |  |  |
| 8 | 8 | 21 | 21 | 22 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 27 | 27 | 27 |  |  |
| 11 | 11 | 15 | 15 | 15 |  |  |
| 12 | 12 | 25 | 25 | 25 |  |  |
| 13 | 13 | 20 | 21 | 23 | 1 |  |
| 14 | 14 | 51 | 51 | 52 |  |  |
| 15 | 15 | 35 | 35 | 35 |  |  |
| 16 | 16 | 23 | 23 | 23 |  |  |
| 17 | 17 | 33 | 54 | 58 | 12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,50 |  |
| 18 | 18 | 18 | 28 | 30 | 1,2,3,4,5,10,11,17,18,19 |  |
| 19 | 19 | 24 | 24 | 24 |  |  |
| 20 | 20 | 43 | 43 | 42 |  |  |
| 21 | 21 | 15 | 15 | 15 |  |  |
| 22 | 22 | 23 | 23 | 23 |  |  |
| 23 | 23 | 28 | 28 | 29 |  |  |
| 24 | 24 | 23 | 23 | 22 |  |  |
| 25 | 25 | 43 | 43 | 44 |  |  |
| 26 | 26 | 25 | 25 | 25 |  |  |
| 27 | 27 | 12 | 12 | 12 |  |  |
| 28 | 28 | 25 | 25 | 25 |  |  |
| 29 | 29 | 11 | 11 | 11 |  |  |
| 30 | 30 | 31 | 31 | 31 |  |  |
| 31 | 31 | 13 | 13 | 13 |  |  |

2SA — data/12.Regnorum_II.txt; chapters 24 vs canon 24. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 27 | 27 | 27 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 39 | 39 | 39 |  |  |
| 4 | 4 | 12 | 12 | 12 |  |  |
| 5 | 5 | 25 | 25 | 25 |  |  |
| 6 | 6 | 23 | 23 | 23 |  |  |
| 7 | 7 | 29 | 29 | 29 |  |  |
| 8 | 8 | 18 | 18 | 18 |  |  |
| 9 | 9 | 13 | 13 | 13 |  |  |
| 10 | 10 | 19 | 19 | 19 |  |  |
| 11 | 11 | 27 | 27 | 27 |  |  |
| 12 | 12 | 31 | 31 | 31 |  |  |
| 13 | 13 | 39 | 39 | 39 |  |  |
| 14 | 14 | 33 | 33 | 33 |  |  |
| 15 | 15 | 37 | 37 | 37 |  |  |
| 16 | 16 | 23 | 23 | 23 |  |  |
| 17 | 17 | 29 | 29 | 29 |  |  |
| 18 | 18 | 33 | 33 | 33 |  |  |
| 19 | 19 | 42 | 42 | 43 |  |  |
| 20 | 20 | 26 | 26 | 26 |  |  |
| 21 | 21 | 22 | 22 | 22 |  |  |
| 22 | 22 | 51 | 51 | 51 |  |  |
| 23 | 23 | 38 | 39 | 39 | 30 | 30a,31a |
| 24 | 24 | 25 | 25 | 25 |  |  |

1KI — data/13.Regnorum_III.txt; chapters 22 vs canon 22. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 53 | 53 | 53 |  |  |
| 2 | 2 | 46 | 46 | 46 |  | 35a,35b,35c,35d,35e,35f,35g,35h,35I,35k,35i,35m,35n,35o,46a,46b,46c,46d,46e,46f,46g,46n,46i,46j,46l |
| 3 | 3 | 27 | 28 | 28 | 1 |  |
| 4 | 4 | 33 | 33 | 34 |  |  |
| 5 | 5 | 17 | 17 | 18 |  |  |
| 6 | 6 | 34 | 34 | 38 |  |  |
| 7 | 7 | 50 | 50 | 51 |  |  |
| 8 | 8 | 64 | 66 | 66 | 12,13 | 53a |
| 9 | 9 | 17 | 28 | 28 | 15,16,17,18,19,20,21,22,23,24,25 |  |
| 10 | 10 | 33 | 33 | 29 |  |  |
| 11 | 11 | 43 | 43 | 43 |  |  |
| 12 | 12 | 32 | 33 | 33 | 2 | 24a,24b,24c,24d,24e,24f,24g,24h,24i,24j,24k,24l,24m,24n,24o,24p,24q,24r,24s,24t,24u,24x,24y,24z |
| 13 | 13 | 33 | 34 | 34 | 27 |  |
| 14 | 14 | 12 | 31 | 31 | 2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20 |  |
| 15 | 15 | 32 | 34 | 34 | 6,32 |  |
| 16 | 16 | 34 | 34 | 34 |  | 28a,28b,28c,28d,28e,28f,28g,28h |
| 17 | 17 | 24 | 24 | 24 |  |  |
| 18 | 18 | 46 | 46 | 46 |  |  |
| 19 | 19 | 21 | 21 | 21 |  |  |
| 20 | 20 | 27 | 29 | 43 | 11,12 |  |
| 21 | 21 | 43 | 43 | 29 |  |  |
| 22 | 22 | 50 | 54 | 53 | 47,48,49,50 |  |

2KI — data/14.Regnorum_IV.txt; chapters 25 vs canon 25. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  | 18a,18b,18c,18d |
| 2 | 2 | 25 | 25 | 25 |  |  |
| 3 | 3 | 27 | 27 | 27 |  |  |
| 4 | 4 | 44 | 44 | 44 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 33 | 33 | 33 |  |  |
| 7 | 7 | 20 | 20 | 20 |  |  |
| 8 | 8 | 29 | 29 | 29 |  |  |
| 9 | 9 | 37 | 37 | 37 |  |  |
| 10 | 10 | 36 | 36 | 36 |  |  |
| 11 | 11 | 21 | 21 | 21 |  |  |
| 12 | 12 | 21 | 21 | 21 |  |  |
| 13 | 13 | 25 | 25 | 25 |  |  |
| 14 | 14 | 28 | 28 | 29 |  |  |
| 15 | 15 | 38 | 38 | 38 |  |  |
| 16 | 16 | 20 | 20 | 20 |  |  |
| 17 | 17 | 41 | 41 | 41 |  |  |
| 18 | 18 | 37 | 37 | 37 |  |  |
| 19 | 19 | 37 | 37 | 37 |  |  |
| 20 | 20 | 21 | 21 | 21 |  |  |
| 21 | 21 | 26 | 26 | 26 |  |  |
| 22 | 22 | 20 | 20 | 20 |  |  |
| 23 | 23 | 37 | 37 | 37 |  |  |
| 24 | 24 | 20 | 20 | 20 |  |  |
| 25 | 25 | 29 | 30 | 30 | 10 |  |

1CH — data/15.Paralipomenon_I.txt; chapters 29 vs canon 29. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 41 | 54 | 54 | 11,12,13,14,15,16,18,19,20,21,22,23,48 |  |
| 2 | 2 | 55 | 55 | 55 |  |  |
| 3 | 3 | 24 | 24 | 24 |  |  |
| 4 | 4 | 43 | 43 | 43 |  |  |
| 5 | 5 | 26 | 26 | 26 |  |  |
| 6 | 6 | 80 | 81 | 81 | 73 |  |
| 7 | 7 | 40 | 40 | 40 |  |  |
| 8 | 8 | 40 | 40 | 40 |  |  |
| 9 | 9 | 44 | 44 | 44 |  |  |
| 10 | 10 | 14 | 14 | 14 |  |  |
| 11 | 11 | 47 | 47 | 47 |  |  |
| 12 | 12 | 39 | 40 | 40 | 8 |  |
| 13 | 13 | 14 | 14 | 14 |  |  |
| 14 | 14 | 17 | 17 | 17 |  |  |
| 15 | 15 | 29 | 29 | 29 |  |  |
| 16 | 16 | 42 | 93 | 43 | 24,39,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92 |  |
| 17 | 17 | 27 | 27 | 27 |  |  |
| 18 | 18 | 17 | 17 | 17 |  |  |
| 19 | 19 | 19 | 19 | 19 |  |  |
| 20 | 20 | 7 | 8 | 8 | 3 |  |
| 21 | 21 | 30 | 30 | 30 |  |  |
| 22 | 22 | 19 | 19 | 19 |  |  |
| 23 | 23 | 32 | 32 | 32 |  |  |
| 24 | 24 | 30 | 31 | 31 | 24 |  |
| 25 | 25 | 31 | 31 | 31 |  |  |
| 26 | 26 | 32 | 32 | 32 |  |  |
| 27 | 27 | 33 | 34 | 34 | 7 |  |
| 28 | 28 | 20 | 21 | 21 | 3 |  |
| 29 | 29 | 30 | 30 | 30 |  |  |

2CH — data/16.Paralipomenon_II.txt; chapters 36 vs canon 36. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 18 | 18 | 18 |  |  |
| 3 | 3 | 16 | 17 | 17 | 12 |  |
| 4 | 4 | 22 | 220 | 22 | 20,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219 |  |
| 5 | 5 | 14 | 14 | 14 |  |  |
| 6 | 6 | 42 | 42 | 42 |  |  |
| 7 | 7 | 22 | 22 | 22 |  |  |
| 8 | 8 | 18 | 18 | 18 |  |  |
| 9 | 9 | 31 | 31 | 31 |  |  |
| 10 | 10 | 19 | 19 | 19 |  |  |
| 11 | 11 | 21 | 23 | 23 | 3,16 |  |
| 12 | 12 | 16 | 16 | 16 |  |  |
| 13 | 13 | 22 | 22 | 22 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |
| 15 | 15 | 19 | 19 | 19 |  |  |
| 16 | 16 | 14 | 14 | 14 |  |  |
| 17 | 17 | 19 | 111 | 19 | 11,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110 |  |
| 18 | 18 | 34 | 34 | 34 |  |  |
| 19 | 19 | 11 | 11 | 11 |  |  |
| 20 | 20 | 37 | 37 | 37 |  |  |
| 21 | 21 | 20 | 20 | 20 |  |  |
| 22 | 22 | 12 | 12 | 12 |  |  |
| 23 | 23 | 21 | 21 | 21 |  |  |
| 24 | 24 | 26 | 26 | 27 |  |  |
| 25 | 25 | 28 | 28 | 28 |  |  |
| 26 | 26 | 23 | 23 | 23 |  |  |
| 27 | 27 | 8 | 9 | 9 | 5 |  |
| 28 | 28 | 27 | 27 | 27 |  |  |
| 29 | 29 | 36 | 36 | 36 |  |  |
| 30 | 30 | 27 | 27 | 27 |  |  |
| 31 | 31 | 20 | 21 | 21 | 3 |  |
| 32 | 32 | 33 | 33 | 33 |  |  |
| 33 | 33 | 24 | 25 | 25 | 7 |  |
| 34 | 34 | 33 | 33 | 33 |  |  |
| 35 | 35 | 27 | 27 | 27 |  | 19a,19b,19c,19d |
| 36 | 36 | 23 | 23 | 23 |  | 2a,2b,2c,4a,5a,5b,5c,5d |

EZR — data/18.Esdras_B.txt; chapters 10 vs canon 10. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 11 | 11 | 11 |  |  |
| 2 | 2 | 67 | 70 | 70 | 16,22,39 |  |
| 3 | 3 | 13 | 13 | 13 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 16 | 17 | 17 | 5 |  |
| 6 | 6 | 21 | 22 | 22 | 20 |  |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 35 | 36 | 36 | 5 |  |
| 9 | 9 | 15 | 15 | 15 |  |  |
| 10 | 10 | 43 | 43 | 44 |  |  |

NEH — data/18.Esdras_B.txt; chapters 13 vs canon 13. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 11 | 1 | 11 | 11 | 11 |  |  |
| 12 | 2 | 20 | 20 | 20 |  |  |
| 13 | 3 | 31 | 32 | 32 | 7 |  |
| 14 | 4 | 22 | 23 | 23 | 11 |  |
| 15 | 5 | 19 | 19 | 19 |  |  |
| 16 | 6 | 19 | 19 | 19 |  |  |
| 17 | 7 | 70 | 79 | 73 | 26,27,68,69,74,75,76,77,78 |  |
| 18 | 8 | 17 | 18 | 18 | 3 |  |
| 19 | 9 | 38 | 38 | 38 |  |  |
| 20 | 10 | 38 | 39 | 39 | 11 |  |
| 21 | 11 | 27 | 36 | 36 | 16,20,21,28,29,32,33,34,35 |  |
| 22 | 12 | 33 | 47 | 47 | 4,5,6,9,15,16,17,18,19,20,21,38,40,41 |  |
| 23 | 13 | 31 | 31 | 31 |  |  |

JDT — data/20.Judith.txt; chapters 16 vs canon 16. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 16 |  |  |
| 2 | 2 | 28 | 28 | 28 |  |  |
| 3 | 3 | 9 | 10 | 10 | 2 |  |
| 4 | 4 | 15 | 15 | 15 |  |  |
| 5 | 5 | 24 | 24 | 24 |  |  |
| 6 | 6 | 21 | 21 | 21 |  |  |
| 7 | 7 | 32 | 32 | 32 |  |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 14 | 19 | 14 | 14,15,16,17,18 |  |
| 10 | 10 | 23 | 23 | 23 |  |  |
| 11 | 11 | 23 | 23 | 23 |  |  |
| 12 | 12 | 20 | 20 | 20 |  |  |
| 13 | 13 | 20 | 20 | 20 |  |  |
| 14 | 14 | 19 | 19 | 19 |  |  |
| 15 | 15 | 14 | 14 | 13 |  |  |
| 16 | 16 | 25 | 25 | 25 |  |  |

TOB — data/21.Tobias.txt; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 22 | 22 | 8 |  |
| 2 | 2 | 14 | 14 | 14 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 21 | 21 | 21 |  |  |
| 5 | 5 | 22 | 22 | 22 |  |  |
| 6 | 6 | 18 | 18 | 17 |  |  |
| 7 | 7 | 17 | 17 | 18 |  |  |
| 8 | 8 | 21 | 21 | 21 |  |  |
| 9 | 9 | 6 | 6 | 6 |  |  |
| 10 | 10 | 12 | 12 | 12 |  |  |
| 11 | 11 | 19 | 19 | 19 |  |  |
| 12 | 12 | 22 | 22 | 22 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |

1MA — data/23.Machabaeorum_i.txt; chapters 16 vs canon 16. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 63 | 64 | 64 | 26 |  |
| 2 | 2 | 70 | 70 | 70 |  |  |
| 3 | 3 | 60 | 60 | 60 |  |  |
| 4 | 4 | 60 | 61 | 61 | 8 |  |
| 5 | 5 | 68 | 68 | 68 |  |  |
| 6 | 6 | 63 | 63 | 63 |  |  |
| 7 | 7 | 50 | 50 | 50 |  |  |
| 8 | 8 | 32 | 32 | 32 |  |  |
| 9 | 9 | 72 | 73 | 73 | 27 |  |
| 10 | 10 | 89 | 89 | 89 |  |  |
| 11 | 11 | 74 | 74 | 74 |  |  |
| 12 | 12 | 53 | 53 | 53 |  |  |
| 13 | 13 | 53 | 53 | 53 |  |  |
| 14 | 14 | 49 | 49 | 49 |  |  |
| 15 | 15 | 41 | 41 | 41 |  |  |
| 16 | 16 | 24 | 24 | 24 |  |  |

2MA — data/24.Machabaeorum_ii.txt; chapters 15 vs canon 15. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 36 | 36 | 36 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 40 | 40 | 40 |  |  |
| 4 | 4 | 50 | 50 | 50 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 31 | 31 | 31 |  |  |
| 7 | 7 | 41 | 42 | 42 | 37 |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 38 | 38 | 38 |  |  |
| 11 | 11 | 37 | 38 | 38 | 30 |  |
| 12 | 12 | 45 | 45 | 45 |  |  |
| 13 | 13 | 26 | 26 | 26 |  |  |
| 14 | 14 | 46 | 46 | 46 |  |  |
| 15 | 15 | 39 | 39 | 39 |  |  |

PRO — data/29.Proverbia.txt; chapters 29 vs canon 31. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 32 | 33 | 33 | 16 |  |
| 2 | 2 | 22 | 22 | 22 |  |  |
| 3 | 3 | 35 | 35 | 35 |  | 16a,22a |
| 4 | 4 | 26 | 27 | 27 | 7 | 27a,27b |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 35 | 35 | 35 |  | 8a,8b,8c,11a |
| 7 | 7 | 26 | 27 | 27 | 18 | 1a |
| 8 | 8 | 35 | 36 | 36 | 33 | 21a |
| 9 | 9 | 18 | 18 | 18 |  | 12a,12b,12c,18a,18b,18c |
| 10 | 10 | 32 | 32 | 32 |  | 4a |
| 11 | 11 | 30 | 31 | 31 | 4 |  |
| 12 | 12 | 28 | 28 | 28 |  | 11a,13a |
| 13 | 13 | 24 | 25 | 25 | 6 | 9a,13a |
| 14 | 14 | 35 | 35 | 35 |  |  |
| 15 | 15 | 29 | 29 | 33 |  | 18a |
| 16 | 16 | 33 | 33 | 33 |  |  |
| 17 | 17 | 28 | 28 | 28 |  | 6a |
| 18 | 18 | 23 | 23 | 24 |  | 22a |
| 19 | 19 | 26 | 26 | 29 |  |  |
| 20 | 20 | 24 | 24 | 30 |  |  |
| 21 | 21 | 30 | 31 | 31 | 5 |  |
| 22 | 22 | 26 | 28 | 29 | 6,27 | 8a,9a,14a |
| 23 | 23 | 34 | 35 | 35 | 23 |  |
| 24 | 24 | 76 | 77 | 34 | 23 | 22a,22b,22c,22d,22e |
| 25 | 25 | 28 | 28 | 28 |  | 10a,29a |
| 26 | 26 | 28 | 28 | 28 |  | 11a |
| 27 | 27 | 27 | 27 | 27 |  | 20a,21a |
| 28 | 28 | 28 | 28 | 28 |  | 17a |
| 29 | 29 | 49 | 49 | 27 |  |  |

SNG — data/31.Canticum.txt; chapters 8 vs canon 8. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 17 | 17 | 17 |  |  |
| 3 | 3 | 11 | 11 | 11 |  |  |
| 4 | 4 | 15 | 16 | 16 | 8 |  |
| 5 | 5 | 17 | 17 | 16 |  |  |
| 6 | 6 | 12 | 12 | 13 |  |  |
| 7 | 7 | 13 | 13 | 13 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |

JOB — data/32.Job.txt; chapters 42 vs canon 42. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 13 | 13 | 13 |  | 9a,9b,9c,9d |
| 3 | 3 | 26 | 26 | 26 |  |  |
| 4 | 4 | 21 | 21 | 21 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 20 | 21 | 21 | 15 |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 35 | 35 | 35 |  |  |
| 10 | 10 | 21 | 21 | 22 |  |  |
| 11 | 11 | 20 | 20 | 20 |  |  |
| 12 | 12 | 25 | 25 | 25 |  |  |
| 13 | 13 | 28 | 28 | 28 |  |  |
| 14 | 14 | 21 | 22 | 22 | 7 |  |
| 15 | 15 | 35 | 35 | 35 |  |  |
| 16 | 16 | 24 | 35 | 22 | 24,25,26,27,28,29,30,31,32,33,34 |  |
| 17 | 17 | 16 | 16 | 16 |  |  |
| 18 | 18 | 21 | 21 | 21 |  |  |
| 19 | 19 | 29 | 29 | 29 |  | 4a |
| 20 | 20 | 29 | 29 | 29 |  |  |
| 21 | 21 | 34 | 34 | 34 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 17 | 17 | 17 |  |  |
| 24 | 24 | 25 | 25 | 25 |  |  |
| 25 | 25 | 6 | 6 | 6 |  |  |
| 26 | 26 | 14 | 14 | 14 |  |  |
| 27 | 27 | 23 | 23 | 23 |  |  |
| 28 | 28 | 28 | 28 | 28 |  |  |
| 29 | 29 | 25 | 25 | 25 |  |  |
| 30 | 30 | 31 | 31 | 31 |  |  |
| 31 | 31 | 40 | 40 | 40 |  |  |
| 32 | 32 | 22 | 22 | 22 |  |  |
| 33 | 33 | 32 | 33 | 33 | 32 |  |
| 34 | 34 | 37 | 37 | 37 |  |  |
| 35 | 35 | 15 | 16 | 16 | 3 |  |
| 36 | 36 | 33 | 33 | 33 |  | 28a,28b |
| 37 | 37 | 24 | 24 | 24 |  |  |
| 38 | 38 | 41 | 41 | 41 |  |  |
| 39 | 39 | 35 | 35 | 30 |  |  |
| 40 | 40 | 27 | 27 | 24 |  |  |
| 41 | 41 | 25 | 25 | 34 |  |  |
| 42 | 42 | 17 | 17 | 17 |  | 17a,17b,17c,17d,17e |

WIS — data/33.Sapientia_Salomonis.txt; chapters 19 vs canon 19. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 16 |  |  |
| 2 | 2 | 24 | 24 | 24 |  |  |
| 3 | 3 | 6 | 19 | 19 | 5,6,7,8,9,10,11,12,13,14,15,16,17 |  |
| 4 | 4 | 21 | 21 | 20 |  |  |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 25 | 25 | 25 |  |  |
| 7 | 7 | 30 | 30 | 30 |  |  |
| 8 | 8 | 21 | 21 | 21 |  |  |
| 9 | 9 | 19 | 19 | 18 |  |  |
| 10 | 10 | 21 | 21 | 21 |  |  |
| 11 | 11 | 26 | 26 | 26 |  |  |
| 12 | 12 | 27 | 27 | 27 |  |  |
| 13 | 13 | 19 | 19 | 19 |  |  |
| 14 | 14 | 31 | 31 | 31 |  |  |
| 16 | 16 | 19 | 19 | 29 |  |  |
| 17 | 17 | 29 | 29 | 21 |  |  |
| 18 | 18 | 21 | 21 | 25 |  |  |
| 19 | 19 | 25 | 25 | 22 |  |  |
| 20 | 20 | 22 | 22 | absent |  |  |

SIR — data/34.Ecclesiasticus.txt; chapters 51 vs canon 51. Nonpositive/nonnumeric chapters: [{"chapter":"0","count":0,"max":0,"nonstandard":["0"],"holes":[]}]

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 26 | 30 | 30 | 5,8,13,21 |  |
| 2 | 2 | 18 | 18 | 18 |  |  |
| 3 | 3 | 29 | 31 | 31 | 19,24 |  |
| 4 | 4 | 31 | 31 | 31 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 37 | 37 | 37 |  |  |
| 7 | 7 | 34 | 36 | 36 | 16,17 | 16a,17a,16b,17b |
| 8 | 8 | 19 | 19 | 19 |  |  |
| 9 | 9 | 18 | 18 | 18 |  |  |
| 10 | 10 | 30 | 31 | 31 | 21 |  |
| 11 | 11 | 32 | 34 | 33 | 15,16 |  |
| 12 | 12 | 18 | 18 | 18 |  |  |
| 13 | 13 | 25 | 26 | 26 | 14 |  |
| 14 | 14 | 27 | 27 | 27 |  |  |
| 15 | 15 | 20 | 20 | 20 |  |  |
| 16 | 16 | 28 | 30 | 29 | 15,16 |  |
| 17 | 17 | 28 | 32 | 32 | 5,16,18,21 |  |
| 18 | 18 | 32 | 33 | 33 | 3 |  |
| 19 | 19 | 27 | 30 | 29 | 18,19,21 |  |
| 20 | 20 | 30 | 31 | 32 | 3 |  |
| 21 | 21 | 28 | 28 | 28 |  |  |
| 22 | 22 | 25 | 27 | 26 | 9,10 |  |
| 23 | 23 | 27 | 27 | 27 |  |  |
| 24 | 24 | 32 | 34 | 34 | 18,24 |  |
| 25 | 25 | 25 | 26 | 26 | 12 |  |
| 26 | 26 | 20 | 29 | 21 | 19,20,21,22,23,24,25,26,27 |  |
| 27 | 27 | 30 | 30 | 30 |  |  |
| 28 | 28 | 26 | 26 | 26 |  |  |
| 29 | 29 | 27 | 28 | 28 | 17 |  |
| 30 | 30 | 23 | 24 | 25 | 18 | 13b |
| 31 | 31 | 31 | 31 | 31 |  |  |
| 32 | 32 | 24 | 24 | 24 |  |  |
| 33 | 33 | 31 | 40 | 33 | 16,17,18,19,20,21,22,23,24 | 16a |
| 34 | 34 | 31 | 31 | 26 |  |  |
| 35 | 35 | 26 | 26 | 20 |  |  |
| 36 | 36 | 27 | 31 | 26 | 13,14,15,16 | 13a,16b |
| 37 | 37 | 31 | 31 | 31 |  |  |
| 38 | 38 | 34 | 34 | 34 |  |  |
| 39 | 39 | 35 | 35 | 35 |  |  |
| 40 | 40 | 30 | 31 | 30 | 30 |  |
| 41 | 41 | 22 | 22 | 24 |  |  |
| 42 | 42 | 25 | 25 | 25 |  |  |
| 43 | 43 | 33 | 33 | 33 |  |  |
| 44 | 44 | 23 | 23 | 23 |  |  |
| 45 | 45 | 26 | 26 | 26 |  |  |
| 46 | 46 | 20 | 20 | 20 |  |  |
| 47 | 47 | 25 | 25 | 25 |  |  |
| 48 | 48 | 25 | 25 | 25 |  |  |
| 49 | 49 | 16 | 16 | 16 |  |  |
| 50 | 50 | 29 | 29 | 29 |  |  |
| 51 | 51 | 30 | 30 | 30 |  |  |

HOS — data/36.Osee.txt; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 11 | 11 | 11 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 5 | 5 | 5 |  |  |
| 4 | 4 | 19 | 19 | 19 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 11 | 11 | 11 |  |  |
| 7 | 7 | 16 | 16 | 16 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |
| 9 | 9 | 17 | 17 | 17 |  |  |
| 10 | 10 | 15 | 15 | 15 |  |  |
| 11 | 11 | 12 | 12 | 12 |  |  |
| 12 | 12 | 14 | 14 | 14 |  |  |
| 13 | 13 | 15 | 15 | 16 |  |  |
| 14 | 14 | 10 | 10 | 9 |  |  |

AMO — data/37.Amos.txt; chapters 9 vs canon 9. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 15 |  |  |
| 2 | 2 | 16 | 16 | 16 |  |  |
| 3 | 3 | 15 | 15 | 15 |  |  |
| 4 | 4 | 13 | 13 | 13 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 14 | 14 | 14 |  |  |
| 7 | 7 | 17 | 17 | 17 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |
| 9 | 9 | 15 | 15 | 15 |  |  |

MIC — data/38.Michaeas.txt; chapters 7 vs canon 7. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 16 |  |  |
| 2 | 2 | 13 | 13 | 13 |  |  |
| 3 | 3 | 12 | 12 | 12 |  |  |
| 4 | 4 | 13 | 13 | 13 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 16 | 16 | 16 |  |  |
| 7 | 7 | 20 | 20 | 20 |  |  |

JOL — data/39.Joel.txt; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 20 | 20 | 20 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 21 | 21 | 21 |  |  |

OBA — data/40.Abdias.txt; chapters 1 vs canon 1. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  | 0 |

JON — data/41.Jonas.txt; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 17 |  |  |
| 2 | 2 | 11 | 11 | 10 |  |  |
| 3 | 3 | 10 | 10 | 10 |  |  |
| 4 | 4 | 11 | 11 | 11 |  |  |

NAM — data/42.Nahum.txt; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 15 |  |  |
| 2 | 2 | 14 | 14 | 13 |  |  |
| 3 | 3 | 19 | 19 | 19 |  |  |

HAB — data/43.Habacuc.txt; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 20 | 20 | 20 |  |  |
| 3 | 3 | 19 | 19 | 19 |  |  |

ZEP — data/44.Sophonias.txt; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  |  |
| 2 | 2 | 14 | 14 | 15 |  |  |
| 3 | 3 | 19 | 20 | 20 | 13 |  |

HAG — data/45.Aggaeus.txt; chapters 2 vs canon 2. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 14 | 14 | 15 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |

ZEC — data/46.Zacharias.txt; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 13 | 13 | 13 |  |  |
| 3 | 3 | 10 | 10 | 10 |  |  |
| 4 | 4 | 14 | 14 | 14 |  |  |
| 5 | 5 | 11 | 11 | 11 |  |  |
| 6 | 6 | 15 | 15 | 15 |  |  |
| 7 | 7 | 14 | 14 | 14 |  |  |
| 8 | 8 | 23 | 23 | 23 |  |  |
| 9 | 9 | 17 | 17 | 17 |  |  |
| 10 | 10 | 12 | 12 | 12 |  |  |
| 11 | 11 | 17 | 18 | 17 | 17 |  |
| 12 | 12 | 13 | 14 | 14 | 12 |  |
| 13 | 13 | 9 | 9 | 9 |  |  |
| 14 | 14 | 21 | 21 | 21 |  |  |

MAL — data/47.Malachias.txt; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 14 | 14 | 14 |  |  |
| 2 | 2 | 17 | 17 | 17 |  |  |
| 3 | 3 | 18 | 18 | 18 |  |  |
| 4 | 4 | 6 | 6 | 6 |  |  |

ISA — data/48.Isaias.txt; chapters 66 vs canon 66. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 31 | 31 | 31 |  | 0 |
| 2 | 2 | 19 | 19 | 22 |  |  |
| 3 | 3 | 25 | 25 | 26 |  |  |
| 4 | 4 | 6 | 6 | 6 |  |  |
| 5 | 5 | 30 | 30 | 30 |  |  |
| 6 | 6 | 13 | 13 | 13 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 21 | 21 | 21 |  |  |
| 10 | 10 | 34 | 34 | 34 |  |  |
| 11 | 11 | 16 | 16 | 16 |  |  |
| 12 | 12 | 4 | 4 | 6 |  |  |
| 13 | 13 | 22 | 22 | 22 |  |  |
| 14 | 14 | 32 | 32 | 32 |  |  |
| 15 | 15 | 9 | 9 | 9 |  |  |
| 16 | 16 | 14 | 14 | 14 |  |  |
| 17 | 17 | 14 | 14 | 14 |  |  |
| 18 | 18 | 7 | 7 | 7 |  |  |
| 19 | 19 | 25 | 25 | 25 |  |  |
| 20 | 20 | 6 | 6 | 6 |  |  |
| 21 | 21 | 17 | 17 | 17 |  |  |
| 22 | 22 | 24 | 24 | 25 |  |  |
| 23 | 23 | 18 | 18 | 18 |  |  |
| 24 | 24 | 23 | 23 | 23 |  |  |
| 25 | 25 | 11 | 11 | 12 |  |  |
| 26 | 26 | 21 | 21 | 21 |  |  |
| 27 | 27 | 13 | 13 | 13 |  |  |
| 28 | 28 | 29 | 29 | 29 |  |  |
| 29 | 29 | 24 | 24 | 24 |  |  |
| 30 | 30 | 33 | 33 | 33 |  |  |
| 31 | 31 | 9 | 9 | 9 |  |  |
| 32 | 32 | 20 | 20 | 20 |  |  |
| 33 | 33 | 24 | 24 | 24 |  |  |
| 34 | 34 | 17 | 17 | 17 |  |  |
| 35 | 35 | 9 | 9 | 10 |  |  |
| 36 | 36 | 22 | 22 | 22 |  |  |
| 37 | 37 | 38 | 38 | 38 |  |  |
| 38 | 38 | 20 | 21 | 22 | 15 |  |
| 39 | 39 | 8 | 8 | 8 |  |  |
| 40 | 40 | 30 | 31 | 31 | 7 |  |
| 41 | 41 | 29 | 29 | 29 |  |  |
| 42 | 42 | 25 | 25 | 25 |  |  |
| 43 | 43 | 28 | 28 | 28 |  |  |
| 44 | 44 | 27 | 27 | 28 |  |  |
| 45 | 45 | 25 | 25 | 25 |  |  |
| 46 | 46 | 13 | 13 | 13 |  |  |
| 47 | 47 | 15 | 15 | 15 |  |  |
| 48 | 48 | 22 | 22 | 22 |  |  |
| 49 | 49 | 26 | 26 | 26 |  |  |
| 50 | 50 | 11 | 11 | 11 |  |  |
| 51 | 51 | 23 | 23 | 23 |  |  |
| 52 | 52 | 15 | 15 | 15 |  |  |
| 53 | 53 | 12 | 12 | 12 |  |  |
| 54 | 54 | 17 | 17 | 17 |  |  |
| 55 | 55 | 13 | 13 | 13 |  |  |
| 56 | 56 | 11 | 11 | 12 |  |  |
| 57 | 57 | 21 | 21 | 21 |  |  |
| 58 | 58 | 14 | 14 | 14 |  |  |
| 59 | 59 | 21 | 21 | 21 |  |  |
| 60 | 60 | 22 | 22 | 22 |  |  |
| 61 | 61 | 11 | 11 | 11 |  |  |
| 62 | 62 | 12 | 12 | 12 |  |  |
| 63 | 63 | 19 | 19 | 19 |  |  |
| 64 | 64 | 12 | 12 | 12 |  |  |
| 65 | 65 | 25 | 25 | 25 |  |  |
| 66 | 66 | 24 | 24 | 24 |  |  |

BAR — data/50.Baruch.txt; chapters 5 vs canon 6. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 35 | 35 | 35 |  |  |
| 3 | 3 | 38 | 38 | 37 |  |  |
| 4 | 4 | 37 | 37 | 37 |  |  |
| 5 | 5 | 9 | 9 | 9 |  |  |

LAM — data/51.Threni_seu_Lamentationes.txt; chapters 5 vs canon 5. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  | 0 |
| 2 | 2 | 22 | 22 | 22 |  |  |
| 3 | 3 | 62 | 66 | 66 | 22,23,24,29 |  |
| 4 | 4 | 22 | 22 | 22 |  |  |
| 5 | 5 | 22 | 22 | 22 |  |  |

EZK — data/53.Ezechiel.txt; chapters 48 vs canon 48. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 27 | 28 | 28 | 14 |  |
| 2 | 2 | 10 | 10 | 10 |  |  |
| 3 | 3 | 27 | 27 | 27 |  |  |
| 4 | 4 | 17 | 17 | 17 |  |  |
| 5 | 5 | 17 | 17 | 17 |  |  |
| 6 | 6 | 14 | 14 | 14 |  |  |
| 7 | 7 | 25 | 27 | 27 | 10,11 | 11s |
| 8 | 8 | 17 | 18 | 18 | 2 |  |
| 9 | 9 | 11 | 11 | 11 |  |  |
| 10 | 10 | 21 | 22 | 22 | 14 |  |
| 11 | 11 | 23 | 25 | 25 | 11,12 |  |
| 12 | 12 | 28 | 28 | 28 |  |  |
| 13 | 13 | 23 | 23 | 23 |  |  |
| 14 | 14 | 23 | 23 | 23 |  |  |
| 15 | 15 | 8 | 8 | 8 |  |  |
| 16 | 16 | 63 | 63 | 63 |  |  |
| 17 | 17 | 24 | 24 | 24 |  |  |
| 18 | 18 | 32 | 32 | 32 |  |  |
| 19 | 19 | 14 | 14 | 14 |  |  |
| 20 | 20 | 49 | 49 | 49 |  |  |
| 21 | 21 | 32 | 32 | 32 |  |  |
| 22 | 22 | 31 | 31 | 31 |  |  |
| 23 | 23 | 48 | 49 | 49 | 3 |  |
| 24 | 24 | 27 | 27 | 27 |  |  |
| 25 | 25 | 17 | 17 | 17 |  |  |
| 26 | 26 | 21 | 21 | 21 |  |  |
| 27 | 27 | 35 | 36 | 36 | 31 |  |
| 28 | 28 | 26 | 26 | 26 |  |  |
| 29 | 29 | 21 | 21 | 21 |  |  |
| 30 | 30 | 26 | 26 | 26 |  |  |
| 31 | 31 | 18 | 18 | 18 |  |  |
| 32 | 32 | 31 | 32 | 32 | 19 |  |
| 33 | 33 | 32 | 33 | 33 | 26 |  |
| 34 | 34 | 31 | 31 | 31 |  |  |
| 35 | 35 | 15 | 15 | 15 |  |  |
| 36 | 36 | 38 | 38 | 38 |  |  |
| 37 | 37 | 28 | 28 | 28 |  |  |
| 38 | 38 | 23 | 23 | 23 |  |  |
| 39 | 39 | 29 | 29 | 29 |  |  |
| 40 | 40 | 48 | 49 | 49 | 30 |  |
| 41 | 41 | 26 | 26 | 26 |  |  |
| 42 | 42 | 20 | 20 | 20 |  |  |
| 43 | 43 | 27 | 27 | 27 |  |  |
| 44 | 44 | 31 | 31 | 31 |  |  |
| 45 | 45 | 25 | 25 | 25 |  |  |
| 46 | 46 | 24 | 24 | 24 |  |  |
| 47 | 47 | 23 | 23 | 23 |  |  |
| 48 | 48 | 35 | 35 | 35 |  |  |

## A Psalms numbering evidence


Observed labels include Psalm 151. Canon has 150 Psalms. A single offset cannot describe the boundaries. Standard candidate relationship to test: LXX 1-8 = canon 1-8; LXX 9 combines canon 9+10; LXX 10-112 corresponds to canon 11-113; LXX 113 combines canon 114+115; LXX 114+115 split canon 116; LXX 116-145 corresponds to canon 117-146; LXX 146+147 split canon 147; LXX 148-150 = canon 148-150. This is a candidate semantic mapping, NOT proven by counts alone: canon.js contains no wording or alignment annotations. The exact directly observed relationship is the chapter labels and counts below; verse offsets also reflect numbered titles. Semantic verse alignment remains a blocker.
| LXX chapters | Canon chapters | Observed LXX total | Canon total |
| --- | --- | --- | --- |
| 9 | 9+10 | 39 | 38 |
| 113 | 114+115 | 26 | 26 |
| 114+115 | 116 | 19 | 19 |
| 146+147 | 147 | 21 | 20 |
| Source chapter | Observed verses | Observed incipit |
| --- | --- | --- |
| 8 | 10 | Εἰς τὸ τέλος, ὑπερ τῶν ληνῶν· ψαλμὸς τῷ Δαυείδ. |
| 9 | 39 | Εἰς τὸ τέλος, ὑπὲρ τῶν κρυφίων τοῦ υἱοῦ· ψαλμὸς τῷ Δαυείδ. |
| 10 | 7 | Εἰς τὸ τέλος· τῷ Δαυεὶδ ψαλμός. Ἐπὶ τῷ κυρίῳ πέποιθα· πῶς ἐρεῖτε τῇ ψυχῇ μου Μεταναστεύου ἐπὶ τὰ ὄρη ὡς στρουθίον ; |
| 112 | 10 | Ἁλληλουιά. |
| 113 | 26 | Ἁλληλουιά. μὴ ἡμῖν, Κύριε. μὴ ἡμῖν ἀλλ᾿ ἢ τῷ ὀνόματί σου δὸς δόξαν ἐπὶ τῷ ἐλέει σου καὶ τῇ ἀληθείᾳ σου. |
| 114 | 10 | Ἁλληλουιά. |
| 115 | 9 | Ἁλληλουιά. τὰς εὐχάς μου ἀποδώσω τῷ κυρίῳ ἐναντίον παντὸς τοῦ λαοῦ αὐτοῦ, |
| 116 | 3 | Ἀλληλουιά. |
| 145 | 11 | Ἁλληλουιά· Ἀγγαίου καὶ Ζαχαρίου. |
| 146 | 11 | Ἀλληλουιά· Ἁγγαίου καὶ Ζαχαρίου. οὐκ ἐν τῆ δυναστείᾳ τοῦ ἵππου θελήσει, οὐδὲ ἐν ταῖς κνήμαις τοῦ ἀνδρὸς εὐδοκεῖ· |
| 147 | 10 | Αλληλουιά· Ἀγγαίου καὶ Ζαχαρίου. |
| 148 | 14 | Ἁλληλουιά· Ἁγγαίου καὶ Ζαχαρίου. τὰ ὄρη καὶ πάντες βουνοί, ξύλα καρποφόρα καὶ πᾶσαι κέδροι· |
| 150 | 7 | Ἁλληλουιά. |
| 151 | 7 | Οὗτος ὁ ψαλμὸς ἰδιόγραφος εἰς Δαυεὶδ καὶ ἔξωθεν τοῦ ἀριθμοῦ, ὅτε ἐμονομάκησεν τῷ Γολιάδ. ἐξῆλθον εἰς συνάντησιν τῷ ἀλλοφύλῳ, καὶ ἐπικατηράσατό με ἐν τοῖς εἰδώλοις αὐτοῦ· |

## B: OpenGreekAndLatin/First1KGreek

Commit: 03776b39f4047c5cff06f5296fae4b2bae4b08fb

Fetch date (UTC): 2026-10-06T20:29:15.404Z

Manifest verification failures: 0

| File | Bytes | SHA-256 |
| --- | --- | --- |
| data/tlg0527/__cts__.xml | 164 | 7719d826a0c351a0b2009defdd584fab973179ba9c2b434ae4b570d46328228c |
| data/tlg0527/tlg001/__cts__.xml | 629 | 31f95fa9f3904565765d18abaa537f20ece0d0d80a010358909fa7754e1c4ba8 |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 603029 | 6e410d3e8eae24874f103b63047ac89c7227c2733474cddbb592cf6c37e717f3 |
| data/tlg0527/tlg002/__cts__.xml | 627 | c6dc7095ad723ee3596aa100aec7b39ee5e60b393420a38886235283febc437c |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | 485894 | 11c5f357ec79815948c6a13b723c95a25328bb64f8f9861e168ee6cb74f8e2ec |
| data/tlg0527/tlg003/__cts__.xml | 635 | b11071902e6549e43d2744aaf928b7f13c548afce00adfbaf12437b6f50e2b3a |
| data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml | 358138 | e6507fd4800bbbcc2ac58a78b404f89a5504aec0743046ba0c2dff3c57a6de16 |
| data/tlg0527/tlg004/__cts__.xml | 630 | 0d9a9c040a0a010054f28202df0f26c794bbb399b2f6bc837dba6d719b821085 |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml | 499875 | 78aa544fa5bdc31723404848adc637a795d2826a8941a2350137d21e2ef099b7 |
| data/tlg0527/tlg005/__cts__.xml | 645 | 157034d37e4147206d46827c01fff892b6eec3ee32376623770465c48199b01d |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml | 474054 | dc146a0f8906279494134040ae3727360cefcfedeeb931aeaec91cec03eb72fa |
| data/tlg0527/tlg006/__cts__.xml | 690 | c2481caa23c076be1de4173a78ccca66b1d932a70e031ddc24c324efa63155a4 |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 314707 | 2d74abf95ff9250dbdd00eba4b948c218bf68fd9a63e587a07747040025b9476 |
| data/tlg0527/tlg008/__cts__.xml | 667 | b9174f4d540615bdbe1559f4d896b85fe7cb2e9f3f9ef1f73601082de2cf896d |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | 386821 | 3d9f8fb6efc66edda5014fa189271fab7fbde403b73f5aa6461958f77579ac24 |
| data/tlg0527/tlg010/__cts__.xml | 621 | 3b8fe4568f040236095d3bc2ddd3458a65adb632a36a9d86ccbdc9e4f5cfecdb |
| data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml | 39574 | c69973e18bf87ba98e7fdef8ea0456a0d478b99b0291033da726f8acb648a484 |
| data/tlg0527/tlg011/__cts__.xml | 675 | 16120ae64f12e85b571eb7599cf6676e4e1382daa36ee332c8e29d91e930ec76 |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | 369187 | 445a1d88e416260803f1a6f8e52df1110aa991456238f283ac7cc6af6d769089 |
| data/tlg0527/tlg012/__cts__.xml | 674 | 963e4f4dcf3acca56fce375f33a9df8d6dfa9043e26244f84af51fed84043617 |
| data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml | 313435 | bfd1967042513a024858d5a15af9da9e783d8585f43cfda479c881ebd04662f1 |
| data/tlg0527/tlg013/__cts__.xml | 674 | fcd42eebdd62b4b1e698fc92ed38f3a042f5ad47e5d5e14b42d585609c4c142d |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | 407414 | 3bd50974a1da62204f3bc617b546511b538634dceeabaf58122f053eabcde1b7 |
| data/tlg0527/tlg014/__cts__.xml | 674 | 02fa7a1e77c8ee12747bb949266671d7cd0056746e5b2c7801508bf3f656cc69 |
| data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml | 341407 | 3eec1a02a061f9a6d9ec4311d355ef40866b5d710caf2d10152267babd53a3d5 |
| data/tlg0527/tlg015/__cts__.xml | 675 | 19d119b3592868e32831e12e79400e9aea0bd13e76a59afe0ccaf1f409e5422f |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 341647 | 0ddcd6201d3b3745611cf589801c528772c37e57580c5b8cf0ece26184d425a5 |
| data/tlg0527/tlg016/__cts__.xml | 677 | 9ac91609c0554d84e579875ea3e3ec258357cd88cad072bc37dbac4002026b6c |
| data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml | 368167 | 5513988b3e57eb0a889692b785092b683ad81564bbcbfd16e7723fd007c7481b |
| data/tlg0527/tlg017/__cts__.xml | 655 | 33ed4a6212b61421a5377a10710d3d3a131de66aa6dfac3e007c6cff57865d09 |
| data/tlg0527/tlg017/tlg0527.tlg017.1st1K-grc1.xml | 179388 | 44f4e12d3d4f4f34701653eca121ad880b3988c1102acb4521738399605cacf0 |
| data/tlg0527/tlg018/__cts__.xml | 676 | 587f987657c22b743cf5503a3baf96f858ea161ffba4a68b3bc421c35da92e7c |
| data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml | 293508 | c2854296300a227c0c09cb39ea0743b933df0fd0ea1d1fb6d566c107ccf31250 |
| data/tlg0527/tlg019/__cts__.xml | 627 | d642f660781e2749b46c14b6096ab6b6f6534c3454c4b8f1a05ea5a6c8d94a4e |
| data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml | 150357 | 82f2b01ea74646fa0f6d3d80a7470a1edf8095a11fc1e13a10e2d88678de0cb4 |
| data/tlg0527/tlg020/__cts__.xml | 629 | a2567747ef2f3ee4cc3fbd7ba5024e869e8aadcaee3c1937ab7026fe66cb1c81 |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | 180253 | 7e755379d0b3f04627597f47d154da8c2320850d35e33ecb6b674273e5049aaa |
| data/tlg0527/tlg021/__cts__.xml | 660 | 2925d135c14d7f1ccf684c70081e4a3698b1587b9d09114606b777c669239476 |
| data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml | 103077 | 380bca2fc080d613a82cc8a468d83841d1af759b62aea0b609ef9aaa60d0a787 |
| data/tlg0527/tlg023/__cts__.xml | 683 | ecc865ee2461ec838b94f985aa67f316c941b2f57f1b77270926fe950319a466 |
| data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml | 396765 | 278fcb432ca9ff870510971a8377e7c57fc76d926bd279f9b6ce403bb1c82445 |
| data/tlg0527/tlg024/__cts__.xml | 684 | d9e04b8a6ecf31b9ff3c3082f0c0932b9a34d5485b5fb6bf0be4c058dda6da72 |
| data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml | 252165 | cdfe0b3033d4f20abcf160266c0efbee84e536f7e2331a9338f3af0bc2830c11 |
| data/tlg0527/tlg025/__cts__.xml | 685 | 99c5c3039aef3361edce42cb328326537367da36b82b475769db792b34ede756 |
| data/tlg0527/tlg025/tlg0527.tlg025.1st1K-grc1.xml | 107162 | c76124d30aeb3fe38a7f7f78db96200f4c3b5fb36e62c7e23785d4798c345a62 |
| data/tlg0527/tlg026/__cts__.xml | 684 | fd9c9aec6a3ec4e8ff0a29727e0b50cb1a7b0346d7227d088c018cd723f84745 |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | 192800 | a81064c25ceacb750636d4ef5381dc1b81d0ba921db006011a3c5bfb0eba88dc |
| data/tlg0527/tlg027/__cts__.xml | 629 | b748425841cb3b5ed225e1fd857c4fbc2881dfe37a8183d234189ea4b5730fcf |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 858587 | a028f5bccc6f23ed0b77f9d578cb08b91ca7b6b4f6dda6ed24efe790a8a9987c |
| data/tlg0527/tlg028/__cts__.xml | 657 | 518494a622ec4e3bd0f0a24d7277bf05a22ee7c221ca292462c2386c7f335051 |
| data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml | 91500 | 5155ba48f1474ef03abeea7a1a74e39b28cc54b4e8159c13208084f80d9b99a8 |
| data/tlg0527/tlg029/__cts__.xml | 639 | ac13d38465ed08655225d3e2f56ba15ef303cc80cedc74f9897b1835f3556f57 |
| data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml | 264713 | d88896708e735578a1c1a5681f1a703d98e48de4d2877bc5d7fc5304493aa333 |
| data/tlg0527/tlg030/__cts__.xml | 497 | 8c18747beee414038769fe22ce8b9cd10398fb5c9696469ef8673fc40c25abee |
| data/tlg0527/tlg031/__cts__.xml | 628 | 8ffdcd3a960a8f3ae50ff69cbab32a1501951d1358a61e2f909d14940828c153 |
| data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml | 50823 | 8c54d2269d065b517d41f6ba69d9e80e8390ef07583b84433968667a309bf4af |
| data/tlg0527/tlg032/__cts__.xml | 621 | 75f1e3be77c5b983ef62421f575540bdf029c035b68aedbf83cdf5b1ee5eba93 |
| data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml | 361541 | b38bd7b2005362f43e639c79ba7c54056ecb1dcae97fc6b12001f7b985a03da5 |
| data/tlg0527/tlg033/__cts__.xml | 662 | 657665a86dcfa1e55c03066df6f652a04e8d918dea0844a42abb9c714441932f |
| data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | 165225 | a4e14aeeafb3c88a6dc8e71bc62cb71d2026b95fb1a014f7e14609db394fa297 |
| data/tlg0527/tlg034/__cts__.xml | 1106 | f3338fd9a6f467fdc9db55236dd1f84e247098f5fbf8c95829125ce37504e24d |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc1.xml | 357746 | e133067f04b110275486f3999607f292ad1af71bc8d58be6e8b936b8ebb0bc90 |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml | 458384 | 554121f0ed01f9754eb0a3910c28e7ffd9337fe59bf4cadcc54f6b13857ca7a1 |
| data/tlg0527/tlg035/__cts__.xml | 695 | 4d2ed23501a8f867a526b2d05c26f25cfdc5221ec9e432c66f6cd195e121de56 |
| data/tlg0527/tlg035/tlg0527.tlg035.1st1K-grc1.xml | 105648 | 539ddb781c11a4cc5e8d954f872e11a37711d9dd8a4a4851f803a14494fd067e |
| data/tlg0527/tlg036/__cts__.xml | 657 | 880b4905cbad84c7a01e77f9e614726bb91b23aea0ef0eed8d507e730605aa29 |
| data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml | 79816 | f24de79f1c96b0577ed304d42001e9f53fef3199cc102d054df7729795272d99 |
| data/tlg0527/tlg037/__cts__.xml | 657 | 70a05803dee9494d12d291c81938da4bee5c388ccdb4f5cd68cfa753bfe9e59e |
| data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml | 66472 | ab1ee5a06f686e5b76245782cacc3e4da763f0b0e58eacea96f3f51d780f022f |
| data/tlg0527/tlg038/__cts__.xml | 666 | 24045c20934bba426e348846fabb5cc9efceea5139bee80b28a65fc3a63f4f0d |
| data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml | 49444 | bbbc5402e38b8c3d732436be69837ee1134afdcf05953df10829a88567bb19de |
| data/tlg0527/tlg039/__cts__.xml | 657 | 748fc02094c94c7507c35a4f3cbb325e9397e67b5bce2cff4595f61d2cbe6981 |
| data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml | 36471 | 0d162e8ab6419b97d54ecbb874e8d4cdfd7fe9193f9b34854596d58e8ae539c9 |
| data/tlg0527/tlg040/__cts__.xml | 649 | 3fcedec411a6527e70792026a9668ac6e018856f3031844ce42c8a2651f02944 |
| data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml | 14952 | ba9ebe6a8f84261a5c7bf40625248c21dc730c572aae0d8a6a546d17621b611d |
| data/tlg0527/tlg041/__cts__.xml | 661 | 339fbbd918a8f36e41109c93fa436f7162a02b98626a0fc9b6c7658eab972b30 |
| data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml | 27343 | 7f4a3f090fcd4b2697515c5a59cb1ffc81718c42d9028223bc844c6d51098731 |
| data/tlg0527/tlg042/__cts__.xml | 660 | ef71d98eac2491c876228f71ecd216e5abbbb3fb331bdfda767c8ad15956f8ea |
| data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml | 25569 | b0c232fefdbfd9e33862157e20f12137ae50227556fa01668561cfb5864a8359 |
| data/tlg0527/tlg043/__cts__.xml | 667 | 1234ecc232037fe0a75c3c523bd1afb6140d03c78aa91af3f67f55f84ec0ecb4 |
| data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml | 29720 | 41d53a9ba5343d4b6a1659f0b30574690343d7d88b2893355f931c57c53aa3de |
| data/tlg0527/tlg044/__cts__.xml | 669 | 9d523953f092048de3fa67b78f8a5e8ba9f8b6e113b2553a1f73072646bc79c8 |
| data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml | 31405 | c80657e88e5c59c466bf8c301b9b9442a5277762e9a0dbbf987c75e52465cbf1 |
| data/tlg0527/tlg045/__cts__.xml | 667 | beb6d97db676e64ee1e81c75092510cfc59d9090ceed3960da77e93d617295bd |
| data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml | 22290 | 70cc0ef34a4c12a280c3407249ca682dc5b8cd777dbf7d31456a7355da1a7a94 |
| data/tlg0527/tlg046/__cts__.xml | 670 | 6f7d2a624e25cbfa8352a044abfd409ccecda8f1d5393760c1d6af710451d6f0 |
| data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml | 110995 | 797fb6e785dcabcb1b59acbe9d3e2df54d133c78059edf638b6087a16600831a |
| data/tlg0527/tlg047/__cts__.xml | 669 | 512dc14a3ddce5245c632d87096e841b8c37445252a182bfc72362cdc0588b0d |
| data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml | 34740 | a96a9a52d4469b74d3365371a96bca27858c8072db6a0466f6f414fa411e533a |
| data/tlg0527/tlg048/__cts__.xml | 3318 | 6965d2511b1256a7a8c1e709e632a531616baaa9305c1658ca3b3b90b53cdf77 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1.xml | 373006 | eab6b21a051bda021365e5ebacb63f81cda4d4145ad77819571fe2059806f495 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1a.xml | 1028682 | d231079be53fd58548c59902b8372f2b7683f21d31ab8ef75218a47bf5f2e14a |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1b.xml | 40834 | b947a7da838b44aaf44fce8ab0241ba6052bf6652a85b744293cf1a91c82faaa |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | 688809 | 0c9cbad97585c5eb8927867d9ce6de6f612bc48b5f13fb0a2ef70a4801e2dca5 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc2.xml | 520194 | bfe2a43203a243442d61bf37700613b45a378bce1d797dd8ef977df564d8ac9b |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul1.xml | 61354 | ff77f3607473460c7aaf70039c6837bf7529254506f1a372b0947c5ffdced047 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul2.xml | 49921 | 9bd80e1900548664f34626c779f3259ce4b01b7b55fd8f21f029122c94a0b85d |
| data/tlg0527/tlg049/__cts__.xml | 669 | 8ebebaa0702966707847e07afe1460d2433898c7cdca31f901f8481fda55c826 |
| data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml | 714624 | 6beecdc05482e53bd899d49274e323c234ccad9e6aadd1d89dc98c4f5ee1c6d5 |
| data/tlg0527/tlg050/__cts__.xml | 662 | 350cad61c42d9b2cc9e72846c0e29bb9cd8abd819d8a4de98534dc5c6cf5628f |
| data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml | 51862 | 5970c69ac576fbab9ab3ccb5edfa2175417ed5566f8404eb25cfe4071a5f6bd1 |
| data/tlg0527/tlg051/__cts__.xml | 681 | ee1cf8b3e22e7d680c609962da2601864b2de3077f108588b5d1911864977652 |
| data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml | 67124 | b2c2712ff7668f1b1a9bd85e548f3dd01e10f70d14c7e8a26a17f96c9b8de998 |
| data/tlg0527/tlg052/__cts__.xml | 697 | bd2cfbb79c1470392a4b9c8e25f1e7f6e0c526906831e958e4e631c8e9d7ab4d |
| data/tlg0527/tlg052/tlg0527.tlg052.1st1K-grc1.xml | 32142 | 07b2e94928153b4d928b685c8121a0c9f685fc2956753b2c3cc62db294b3c44e |
| data/tlg0527/tlg053/__cts__.xml | 669 | 680ecca9456a921d61f8aad6895beb59c17b29299b705c74c0af7a0ced9479c3 |
| data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml | 618574 | 579c1c683cf79bfcab72629faa59aa65b59948a31dbcae7f2d53d04116401533 |
| data/tlg0527/tlg054/__cts__.xml | 707 | c16a10cb097c98f84d270573973e25a359d9a23e8417ce99d11a00aea851f19f |
| data/tlg0527/tlg054/tlg0527.tlg054.1st1K-grc1.xml | 19668 | 931b8f51b78b936113711755b6ff1f3257fba511acfc70826dd9f300719a0ce6 |
| data/tlg0527/tlg055/__cts__.xml | 711 | cdf0d64a6ae40ec4f532652f6808a166e0b1a2ebd18d6fa24aa141ac8dc17a92 |
| data/tlg0527/tlg055/tlg0527.tlg055.1st1K-grc1.xml | 27643 | 436dc7bdfcba0e551492d04689b89ed3fa51920bbf7c60bcfb437a542cc3dfec |
| data/tlg0527/tlg056/__cts__.xml | 702 | 8d52f936c15c13f226ab6665d6b9ce991bed93fde71831e7c4ef931770f9a290 |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | 195936 | fa8160a315688cd94c30f534de26b9ec6250d4c41ab2059eafff3e43a5a6a465 |
| data/tlg0527/tlg057/__cts__.xml | 706 | 545d1cbbfd4268fb962f353bf0792657b196112386e9dfb288b21931df55ca73 |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | 197102 | 7a2f052ef94ce28968f978a13c35f3199ce4a9e5adfbf32fce36d5a76002621c |
| data/tlg0527/tlg058/__cts__.xml | 724 | aa729f08ed14d2e3b9c04a637225bd655502509c37f8772ff688a277bbb0ea74 |
| data/tlg0527/tlg058/tlg0527.tlg058.1st1K-grc1.xml | 18114 | dd29011364fb416457382406c463a21a43a26ca692c480668a2423e94f7d5e35 |
| data/tlg0527/tlg059/__cts__.xml | 728 | dfbbcb211a43e11d1b302b15bd40c9b98b4ed91ba87cd49447daa9cdd36568aa |
| data/tlg0527/tlg059/tlg0527.tlg059.1st1K-grc1.xml | 19021 | 2af9b536e2cf12e1f6bc52a6ceae10f02e7c75290d4f35623f40c35bc78a8453 |
| license.md | 18625 | ccf0e8ce183761bf82700126cc45a4e907b2cede024e65e3fef5c2338b9b7063 |
| README.md | 1857 | 9ed880acddf0b303442c61e45bfc029fba329077d08fc0991c11aad76e3d7dda |

## B per-book-file header license

| File | License text found | Consistent with CC BY-SA 4.0? |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg017/tlg0527.tlg017.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg025/tlg0527.tlg025.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg035/tlg0527.tlg035.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1a.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1b.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc2.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul2.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg052/tlg0527.tlg052.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg054/tlg0527.tlg054.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg055/tlg0527.tlg055.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg058/tlg0527.tlg058.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |
| data/tlg0527/tlg059/tlg0527.tlg059.1st1K-grc1.xml | Available under a Creative Commons Attribution-ShareAlike 4.0 International License https://creativecommons.org/licenses/by-sa/4.0/ | Y |

## B excluded non-Swete editions / commentary

| File | Rejection reason from own file header |
| --- | --- |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc1.xml | Not Greek Swete: Ecclesiasticus John Henry Arthur Hart Septuaginta Cambridge University Press Cambridge 1909 Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1.xml | Not Greek Swete: The Book of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 1 The Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1a.xml | Not Greek Swete: The Book Of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 2 The Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-eng1b.xml | Not Greek Swete: The Book Of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 2 The Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc2.xml | Not Greek Swete: The Book Of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 2 The Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul1.xml | Not Greek Swete: The Book Of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 2 The Internet Archive |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-mul2.xml | Not Greek Swete: The Book Of Isaiah Richard Rusden Ottley Septuaginta Cambridge University Press Cambridge 1904 2 The Internet Archive |

A missing per-file header does not override the repository README license grant, but fails the requested per-file-header criterion. Metadata __cts__.xml files are inventoried but are not book text files. B licenses are extracted only from each TEI header, never inferred from the repo.

## B coverage

| File | Canon ID / content | Chapter labels | Verse records |
| --- | --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | GEN | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50 | 1523 |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | EXO | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40 | 1160 |
| data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml | LEV | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27 | 858 |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml | NUM | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36 | 1285 |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml | DEU | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34 | 948 |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | JOS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24 | 661 |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | JDG | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21 | 618 |
| data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml | RUT | 1,2,3,4 | 85 |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | 1SA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31 | 769 |
| data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml | 2SA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24 | 695 |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | 1KI | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22 | 830 |
| data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml | 2KI | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25 | 721 |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 1CH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29 | 922 |
| data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml | 2CH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36 | 827 |
| data/tlg0527/tlg017/tlg0527.tlg017.1st1K-grc1.xml | 1 Esdras | 1,2,3,4,5,6,7,8,9 | 430 |
| data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml | EZR+NEH | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 | 649 |
| data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml | EST | prologue,1,2,3,4,5,6,7,8,9,10 | 266 |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | JDT | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 | 339 |
| data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml | TOB | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 243 |
| data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml | 1MA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 | 921 |
| data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml | 2MA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 | 553 |
| data/tlg0527/tlg025/tlg0527.tlg025.1st1K-grc1.xml | 3 Maccabees | 1,2,3,4,5,6,7 | 227 |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | 4 Maccabees | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18 | 481 |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | PSA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151 | 2514 |
| data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml | Odes (including Prayer of Manasseh) | 1,2,3,iva,ivb,5,6,7,8,9,10,11,12,13,14 | 228 |
| data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml | PRO | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29 | 928 |
| data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml | SNG | 1,2,3,4,5,6,7,8 | 116 |
| data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml | JOB | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42 | 1077 |
| data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | WIS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20 | 424 |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml | SIR | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51 | 1369 |
| data/tlg0527/tlg035/tlg0527.tlg035.1st1K-grc1.xml | Psalms of Solomon | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18 | 332 |
| data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml | HOS | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 197 |
| data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml | AMO | 1,2,3,4,5,6,7,8,9 | 146 |
| data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml | MIC | 1,2,3,4,5,6,7 | 105 |
| data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml | JOL | 1,2,3 | 73 |
| data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml | OBA | 1 | 21 |
| data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml | JON | 1,2,3,4 | 48 |
| data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml | NAM | 1,2,3 | 48 |
| data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml | HAB | 1,2,3 | 56 |
| data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml | ZEP | 1,2,3 | 51 |
| data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml | HAG | 1,2 | 37 |
| data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml | ZEC | 1,2,3,4,5,6,7,8,9,10,11,12,13,14 | 210 |
| data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml | MAL | 1,2,3,4 | 55 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | ISA | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66 | 1277 |
| data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml | JER | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52 | 1293 |
| data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml | BAR | 1,2,3,4,5 | 141 |
| data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml | LAM | 1,2,3,4,5 | 150 |
| data/tlg0527/tlg052/tlg0527.tlg052.1st1K-grc1.xml | Letter of Jeremiah (Catholic Baruch 6 component) |  | 72 |
| data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml | EZK | 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48 | 1262 |
| data/tlg0527/tlg054/tlg0527.tlg054.1st1K-grc1.xml | Susanna Old Greek (Daniel component) | 1 | 46 |
| data/tlg0527/tlg055/tlg0527.tlg055.1st1K-grc1.xml | Susanna Theodotion (Daniel component) | 1 | 64 |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | DAN | 1,2,3,4,5,6,7,8,9,10,11,12 | 416 |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | DAN | 1,2,3,4,5,6,7,8,9,10,11,12 | 412 |
| data/tlg0527/tlg058/tlg0527.tlg058.1st1K-grc1.xml | Bel and Dragon Old Greek (Daniel component) | 1 | 35 |
| data/tlg0527/tlg059/tlg0527.tlg059.1st1K-grc1.xml | Bel and Dragon Theodotion (Daniel component) | 1 | 36 |

In-canon present (45): GEN, EXO, LEV, NUM, DEU, JOS, JDG, RUT, 1SA, 2SA, 1KI, 2KI, 1CH, 2CH, EZR, NEH, TOB, JDT, EST, 1MA, 2MA, JOB, PSA, PRO, SNG, WIS, SIR, ISA, JER, LAM, BAR, EZK, DAN, HOS, JOL, AMO, OBA, JON, MIC, NAM, HAB, ZEP, HAG, ZEC, MAL

In-canon missing (28): ECC, MAT, MRK, LUK, JHN, ACT, ROM, 1CO, 2CO, GAL, EPH, PHP, COL, 1TH, 2TH, 1TI, 2TI, TIT, PHM, HEB, JAS, 1PE, 2PE, 1JN, 2JN, 3JN, JUD, REV

Out-of-canon files: 1 Esdras [data/tlg0527/tlg017/tlg0527.tlg017.1st1K-grc1.xml]; 3 Maccabees [data/tlg0527/tlg025/tlg0527.tlg025.1st1K-grc1.xml]; 4 Maccabees [data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml]; Odes (including Prayer of Manasseh) [data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml]; Psalms of Solomon [data/tlg0527/tlg035/tlg0527.tlg035.1st1K-grc1.xml]. Psalm 151 is embedded in Psalmi, not a separate file. Components of in-canon Daniel/Baruch are listed separately, not classified as excluded books.

Baruch is file 50, Letter of Jeremiah file 52; the letter is not already Baruch chapter 6. Susanna files 54/55 and Bel files 58/59 are separate Old Greek / Theodotion witnesses. Daniel files 56/57 are also separate witnesses; their chapter 3 counts are below. Esther is file 19 and includes a nonnumeric prologue: keep original references. Esdras B file 18 combines Ezra/Nehemiah; audit labels chapters 1-10 EZR and 11 onward NEH with diagnostic -10 chapter indexing; this is not an approved import mapping. Odes chapter 8 contains Prayer of Manasseh; detached title evidence is below.

## B encoding and polytonic inventory

| File | UTF-8 valid | BOM | Raw NFC | Raw NFD | Verse NFC exceptions | Greek letters | Greek Extended code points | Combining marks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | true | false | false | false | 1503 | 147996 | 39017 | 47 |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | true | false | false | false | 1155 | 117202 | 29799 | 63 |
| data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml | true | false | false | false | 840 | 89761 | 23898 | 3 |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml | true | false | false | false | 1274 | 122067 | 30816 | 10 |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml | true | false | false | false | 946 | 104741 | 27045 | 7 |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | true | false | false | false | 629 | 70836 | 18398 | 1 |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | true | false | false | false | 616 | 74511 | 19173 | 5 |
| data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml | true | false | false | false | 85 | 9514 | 2326 | 2 |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | true | false | false | false | 764 | 93366 | 23800 | 10 |
| data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml | true | false | false | false | 564 | 84237 | 19799 | 3 |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | true | false | false | false | 555 | 97958 | 21924 | 0 |
| data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml | true | false | false | false | 666 | 88581 | 22034 | 8 |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | true | false | false | false | 68 | 77842 | 16232 | 0 |
| data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml | true | false | false | false | 21 | 103644 | 20490 | 0 |
| data/tlg0527/tlg017/tlg0527.tlg017.1st1K-grc1.xml | true | false | false | false | 3 | 45653 | 8388 | 0 |
| data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml | true | false | false | false | 31 | 63241 | 12927 | 0 |
| data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml | true | false | false | false | 50 | 29918 | 5435 | 0 |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | true | false | false | false | 10 | 45086 | 8821 | 0 |
| data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml | true | false | false | false | 26 | 26672 | 5141 | 0 |
| data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml | true | false | false | false | 177 | 94125 | 17848 | 0 |
| data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml | true | false | false | false | 211 | 66570 | 10388 | 0 |
| data/tlg0527/tlg025/tlg0527.tlg025.1st1K-grc1.xml | true | false | false | false | 29 | 29133 | 4330 | 0 |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | true | false | false | false | 12 | 43042 | 6742 | 0 |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | true | false | false | false | 530 | 168547 | 29970 | 0 |
| data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml | true | false | false | false | 12 | 19582 | 3631 | 0 |
| data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml | true | false | false | false | 237 | 59334 | 9961 | 2 |
| data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml | true | false | false | false | 49 | 9953 | 1642 | 0 |
| data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml | true | false | false | false | 166 | 66021 | 12293 | 0 |
| data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | true | false | false | false | 67 | 36388 | 5946 | 0 |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml | true | false | false | false | 84 | 97408 | 16908 | 0 |
| data/tlg0527/tlg035/tlg0527.tlg035.1st1K-grc1.xml | true | false | false | false | 1 | 23901 | 4736 | 0 |
| data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml | true | false | true | false | 0 | 19777 | 3720 | 0 |
| data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml | true | false | false | false | 2 | 16087 | 2953 | 0 |
| data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml | true | false | true | false | 0 | 11714 | 2097 | 0 |
| data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml | true | false | false | false | 1 | 7975 | 1448 | 0 |
| data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml | true | false | true | false | 0 | 2272 | 438 | 0 |
| data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml | true | false | false | false | 4 | 5063 | 958 | 0 |
| data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml | true | false | false | false | 7 | 4878 | 823 | 0 |
| data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml | true | false | false | false | 2 | 5514 | 951 | 0 |
| data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml | true | false | false | false | 7 | 6218 | 1136 | 0 |
| data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml | true | false | false | false | 2 | 4530 | 846 | 0 |
| data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml | true | false | false | false | 10 | 24849 | 4406 | 0 |
| data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml | true | false | false | false | 1 | 7226 | 1237 | 0 |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | true | false | false | false | 212 | 132800 | 24657 | 0 |
| data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml | true | false | false | false | 196 | 143012 | 27251 | 0 |
| data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml | true | false | true | false | 0 | 12687 | 2495 | 0 |
| data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml | true | false | false | false | 21 | 12978 | 2155 | 0 |
| data/tlg0527/tlg052/tlg0527.tlg052.1st1K-grc1.xml | true | false | true | false | 0 | 6525 | 1185 | 0 |
| data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml | true | false | false | false | 65 | 141453 | 26878 | 0 |
| data/tlg0527/tlg054/tlg0527.tlg054.1st1K-grc1.xml | true | false | false | false | 1 | 4617 | 841 | 0 |
| data/tlg0527/tlg055/tlg0527.tlg055.1st1K-grc1.xml | true | false | false | false | 3 | 5813 | 1051 | 0 |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | true | false | false | false | 9 | 54501 | 10179 | 0 |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | true | false | false | false | 23 | 49553 | 9527 | 0 |
| data/tlg0527/tlg058/tlg0527.tlg058.1st1K-grc1.xml | true | false | false | false | 2 | 4297 | 798 | 0 |
| data/tlg0527/tlg059/tlg0527.tlg059.1st1K-grc1.xml | true | false | false | false | 3 | 3627 | 687 | 0 |

Greek Extended/combining marks confirm polytonic characters survive, not textual correctness. Mixed Latin/Greek and suspicious isolated Latin tokens are flagged rather than converted. NFC is tested, not applied to cached source bytes. NFD counts are available in audit JSON.

## B artifacts: counts and up to 10 examples EACH


### XML pb elements: 2419

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:- | {"@_n":"1"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | {"@_n":"2"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:29 | {"@_n":"3"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:16 | {"@_n":"4"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 3:7 | {"@_n":"5"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 3:24 | {"@_n":"6"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 4:17 | {"@_n":"7"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 5:7 | {"@_n":"8"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 5:27 | {"@_n":"9"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 6:13 | {"@_n":"10"} |

### XML headings: 244

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1 | ΓΕΝΕΣΙΣ ΚOΣMOY |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml |  | ΕΞΟΔΟΣ |
| data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml |  | ΛΕΥΕΙΤΙΚΟΝ |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml |  | ΑΡΙΘΜΟΙ |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml |  | ΔEYTEPONOMION |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml |  | ΚΡΙΤΑΙ |
| data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml |  | ΡΟΥΘ |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml |  | BASIΛEIΩN A |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml |  | ΒΑΣΙΛΕΙΩΝ Γ |
| data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml |  | ΒΑΣΙΛΕΙΩΝ Δ |

### XML lb elements: 9966

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:1 | {"@_n":"2"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:2 | {"@_n":"3"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:3 | {"@_n":"4"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:4 | {"@_n":"5"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:5 | {"@_n":"6"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:6 | {"@_n":"7"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:7 | {"@_n":"8"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:8 | {"@_n":"9"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:9 | {"@_n":"10"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:10 | {"@_n":"11"} |

### variant sigla / marginal notes: 3930

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:2 | A |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | D. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | Α |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | ¶ D |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:19 | ¶ D |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:25 | § D |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:29 | A |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:1 | D |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:16 | Α |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:24 | § D |

### apparatus notes: 2427

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | Inscr γένεσις E I 4 ἔιδεν A b 6 —7 ὕδατος εποιησεν sup ras Α 1?a? 10 συστήματα Ε 11 κάτα γένος εἰς ομ.] εἰς ομ. κάτα γένος E 14 εἰς φαῦσιν AD] ὥστε φαίνειν ἔπι Ε |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:29 | 14 καὶ ἄρχειν ... νυκτος Ι°] καὶ ἀρχέτωσαν (D)... νυκτὸς D* (rescr D a) om Ε \| καὶ διαχ.] του διαχ. D \| om εἰς 5° D 20—25 quae uncis perier in Α 21 κάτα 2° Ε] καιπα Α (κὰι πᾶ A b?) 24 om καὶ 25 om καὶ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:16 | 29 σπείρων Α 29 — II 3 quae uncis incl sunt perier in Α 30 post DE παντὶ ras 2 vel 3 litt Α \| om τὼ D sil Ε 31 rescr omn D a \| om τὰ Ε II 1 post συνετελ. ras 7 litt Α 3 om ἔργων E 5 πάντα] πὰν Ε \| om  |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 3:7 | 17 φαγησθε] φάγῃ Ε 19 om ἔαν E 20 om Αδαμ Ι° E Ε \| τὼ ’δε Αδ. Ε 23 om ὀστοῦν A* (hab vid Α 1?mg E) Ι om ἀυτὴ 2 24 ἦ γυναικὶ] πρὸς τὴν γυναῖκα DE III 1 φρονιμωτε[ρος] D \| θεὸς 2°] pr κݲςݲ Ε \| παραδείσο |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 3:24 | 8 τῆς φωνῆς E Ι om κυρίου 2° E \| om. του ξύλου E 10 περιπατουντος] περιπαντος Α 11 εἰ μὴ] + ὅτι E 12 om ο Ε 14 συ] σοι E \| τῆς γης] pr τῶν ἔπι A a?mg E \| τῆ κοιλία] + σου E 17 τούτου] τοῦτο E \| om ἐν  |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 4:17 | 24 χερουβιμ Ε IV 1 συνέλαβεν καὶ] συλλαβοῦσα D sil E 3 κυρίω] θὼ Ε 5 ἔπι Ι°] ἔπει Ε \| ταῖς θυσίαις AD (θυσι...)] τοις 7 προσενεγκεις Ε 9 ο θεος] pr κݲςݲ Ε \| om ἐστιν Ε τι]+του τοῦτο Ε b) 11 ἄπο τῆς γῆ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 5:7 | 17 om του υἱοῦ D 18 ἐγεννήθη DE \| Μαιηλ Ι°] Μαουια D Μαουιηλ DE E Ι Μαιηλ 2°] Μαουιηλ D Μαουιηλ Ε 20 Ιωβηδ E 22 χαλκευς] Ε 23 ἐμοὶ 2°] μοι Ε 25 επωνομασεν] πω sup ras 18 litt 26 post θݲυݲ ras 8 litt Α |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 5:27 | 8 αἰ ἠμ’. Σηθ] + ἃς ἔζησεν D \| post ενν. ras 3 litt Α? \| δωδ. ἔτη D sil E 9 ἕκατον A 1?mg \| ἔτη ἕκατον ενε... D 10 πέντε καὶ δέκα ἔτη καὶ επτακ. D sil E 11 πέντε ἔτη καὶ εννακ. (+ ἔτη D) DE 12 εβδ. ἔτ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 6:13 | 28 ὀκτὼ καὶ ογδοηκ. καὶ ἕκατον ἔτη D (..ω και ογδοηκον\|..) Ε 30 πέντε καὶ εξηκοݲτα καὶ πεντακ. ἔτη Ε 31 τρία καὶ πεντηκ. καὶ επτακ. ἔτη VI 1 ΧαΦ Α \| γεινεσθαι Α \| εγεννηθησαν E 2 ἄγγελοι sup ras Α ?vi |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 7:4 | 15 τριακοσιων] τετρακοσίων Ε \| πηχ. τὸ μηκος] om to D 16 συντελεις 17 ἐγὼ ’δε ἴδου] ἴδε ἐγὼ Ε \| om ἐν ἀυτὴ Ε \| ἔαν η] ἔαν ἢν Ε 18 κα γυνὴ σου καὶ οἱ υἱοὶ σου Ε 20 om τῶν ὀρνέων Ε \| om ἑρπόντων Ε \| om  |

### XML milestone elements: 86

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 15:18 | {"@_unit":"altref","@_n":"21"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 19:3 | {"@_unit":"altref","@_n":"4"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 22:3 | {"@_unit":"altref","@_n":"4"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 22:15 | {"@_unit":"altref","@_n":"16"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 23:6 | {"@_unit":"altref","@_n":"6"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 24:18 | {"@_unit":"altref","@_n":"19"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 24:26 | {"@_unit":"altref","@_n":"26"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 31:46 | {"@_unit":"altref","@_n":"48"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 31:48 | {"@_unit":"altref","@_n":"52"} |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 31:48 | {"@_unit":"altref","@_n":"48"} |

### editorial markers: 338

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:13 | § :: καὶ ἐγένετο §ἐσπέρα καὶ ἐγένετο πρωί, ἡμέρα τρίτη. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:14 | § :: καὶ § εἶπεν ὁ θεός Γενηθήτωσαν φωστῆρες ἐν τῷ στερεώματι τοῦ οὐρανοῦ εἰς φαῦσιν τῆς γῆς, καὶ ἄρχεῖν τῆς ἡμέρας καὶ τῆς νυκτὸς καὶ διαχωρίζειν ἀνὰ μέσον τῆς ἡμέρας καὶ ἀνὰ μέσον τῆς νυκτός· καὶ ἔσ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:19 | ¶ :: καὶ ἐγένετο ἑσπέρα καὶ ἐγένετο πρωί, ἡμέρα τετάρτη. ¶ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:26 | § :: §καὶ εἶπεν ὁ θεός Ποιήσωμεν ἄνθρωπον κατ’ εἰκόνα ἡμετέραν καὶ κἀθ᾽ ὁμοίωσιν· καὶ ἀρχέτωσαν τῶν ἰχθύων τῆς θαλάσσης καὶ τῶν πετεινῶν τοῦ οὐρανοῦ καὶ τῶν κτηνῶν καὶ πάτης τῆς γῆς καὶ πάντων τῶν ἑρπ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:1 | ¶ :: [Καὶ ¶ συνετε]λέσθησαν ὁ οὐρανὸς κ]αὶ ἡ γῆ καὶ πᾶς ὁ κόσμος [αὐτῶν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:24 | § :: ἕνεκεν τούτου καταλείψει ἄνθρωπος τὸν πατέρα αὐτοῦ καὶ τὴν μητέρα αὐτοῦ, καὶ §προσκολληθήσεται τῇ γυναικὶ αὐτοῦ· καὶ ἔσονται οἱ δύο εἰς σάρκα μίαν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 3:5 | ¶ :: ᾔδει γὰρ ὁ θεὸς ὅτι ἐν ἧ ἂν ἡμέρᾳ φάγησθε ἀπ’ αὐτοῦ, διανοιχθήσονται ὑμῶν οἱ ὀφθαλμοί, καὶ ἔσεσθε ὡς θεοί, γινώσκοντες καλὸν καὶ πονηρόν.¶ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 4:1 | § :: § Ἀδὰμ δὲ ἔγνω Εὕαν τὴν γυναῖκα αὐτοῦ, καὶ συνέλαβεν κα ἔτεκεν τὸν Κάιν. καὶ εἶπεν Ἐκτησάμην ἄνθρωπον διὰ τοῦ θεοῦ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 4:5 | ¶ :: ἐπὶ δὲ Κάιν καὶ ἐπὶ ταῖς θυσίαις αὐτοῦ ¶ οὐ προσέσχεν. καὶ ἐλύπησεν τὸν Κάιν λίαν καὶ συνέπεσεν τῷ προσώπῳ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 4:17 | § :: Καὶ ἔγνω Κάιν τὴν γυναῖκα αὐτοῦ, καὶ § συλλαβοῦσα ἔτεκεν τὸν Ἑνώχ. καὶ ἦν οἰκοδομῶν πόλιν· καὶ ἐπωνόμασεν τὴν πόλιν ἐπὶ τῷ ὀνόματι τοῦ υἱοῦ αὐτοῦ Ἐνώχ. |

### brackets: 148

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:20 | [ / ] / [ / ] :: Καὶ εἶπεν ὁ θεός Ἑξαγαγέτω τὰ ὕδατα ἑρπετὰ ψυχῶν ζωσῶν καὶ πετεινὰ πετόμεν[α] ἐπὶ τῆς γῆς κατὰ τὸ στερέωμ[α του] οὐρανοῦ • καὶ ἐγένετο οὕτως. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:21 | [ / ] / [ / ] / [ / ] / [ / ] :: καὶ ἐποίησεν ὁ θεὸς τὰ κήτη [τὰ με]γάλα καὶ πᾶσαν ψυχὴν [ζῴων ἑρπε]τῶν, ἃ ἐξήγαγεν [τὰ ὕδατα κατὰ γένη αὐτῶν], καὶ πᾶν πετεινὸν πτ[ερωτὸν] κατὰ γένος· καὶ ἴδεν ὁ [θεὸς |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:22 | [ / ] / [ / ] / [ / ] / [ / ] :: καὶ ηὐλόγησεν αὐτὰ ὁ θ[εὸς λέγων] Αὐξάνεσθε καὶ πληθ[ύνεσθε, καὶ] πληρώσατε τὰ ὕδατα [ἐν ταῖς θα]λάσσαις, καὶ τὰ πετε[ινὰ πληθυ]νέσθωσαν ἐπὶ τῆς γῆς. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:23 | ] / [ / ] :: καὶ ἐγέ]νετο ἑσπέρα καὶ εγ[ένετο πρωί], ἡμέρα πέμπτη. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:24 | [ / ] / [ / ] / [ / ] / [ / ] :: Καὶ εἶπεν ὁ θεός Ἐξαγαγ[έτω ἡ γῆ ψυχὴν] ζῶσαν κατὰ γένος, [τετράποδα] καὶ ἑρπετὰ καὶ θηρί[α τῆς γῆς κατὰ] γένος, καὶ ἐγένετο [οὕτως]. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:25 | [ / ] / [ / ] / [ / ] :: καὶ ἐποίησεν ὁ θεὸς τὰ [θηρία τῆς γῆς] κατὰ γένος καὶ τὰ κτ[ήνη κατὰ γέ]νος καὶ πάντα τὰ ἑρπ[ετὰ τῆς γῆς] κατὰ γένος αὐτῶν· καὶ ἴδεν ὁ θεὸς ὅτι καλά. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:29 | [ / ] :: καὶ εἶπεν ὁ θεός ἰδοὺ δέδωκα ὑμῖν πᾶν χόρτον σπόριμον σπεῖρον σπέρμα, ὅ ἐστιν ἐπάνω πάσης τῆς γῆς· καὶ πᾶν ξύλον, ὃ ἔχει ἐν ἑαυτῷ καρπὸν σπέρματος σπορίμου· [ὑ]μῖν ἔσται εἰς βρῶσιν, |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:30 | [ / ] / [ / ] / [ / ] / [ / ] :: καὶ πᾶσι [τοῖ]ς θηρίοις τῆς γῆς καὶ πᾶσι [τοῖ]ς πετεινοῖς τοῦ οὐρανοῦ [καὶ π]αντὶ ἑρπετῷ τῷ ἕρπον[τι ἐπὶ τῆς] γῆς, ὃ ἔχει ἐν ἑαυτῷ [ψυχὴ]ν ζωῆς· καὶ πάντα χόρ[τον χλ]ω |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 1:31 | [ / ] / [ / ] / [ / ] / ] :: [καὶ ἴδεν ὁ] θεὸς τὰ πάντα ὅσα ἐποίη[σεν, καὶ] ἰδοὺ καλὰ λίαν. καὶ ἐγέ[νετο ἑσ]πέρα καὶ ἐγένετο πρωί, ἡμέρα ἡμέρα ἕ]κτη. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 2:1 | [ / ] / ] / [ :: [Καὶ ¶ συνετε]λέσθησαν ὁ οὐρανὸς κ]αὶ ἡ γῆ καὶ πᾶς ὁ κόσμος [αὐτῶν. |

### Latin-script tokens (suspected OCR / sigla): 521

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 8:4 | Áραρἀτ. :: καὶ ἐκάθισεν ἡ κιβωτὸς ἐν μηνὶ τῷ ἑβδόμῳ, ἑβδόμῃ καὶ εἰκάδι τοῦ μηνός, ἐπὶ τὰ ὄρη τὰ Áραρἀτ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 8:22 | IX :: πάσας τὰς ἡμέρας τῆς γῆς σπέρμα θερισμός, ψῦχος καὶ καῦμα, θέρος καὶ ἔαρ ἡμέραν καὶ νύκτα οὐ κατα- IX |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 9:1 | IXκαὶ :: IXκαὶ εἶπεν αὐτοῖς Αὐξάνεσθε καὶ πληθύνεσθε, καὶ πληρώσατε τὴν γῆν καὶ κατακυριεύσατε αὐτῆς. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 11:4 | L :: καὶ εἶπαν Δεῦτε μὲν ἐαυτοῖς πόλιν καὶ πύργον, οὗ ἡ κεφαλὴ ἔσται ἕως τοῦ οὐρανοῦ, καὶ ποιήσομεν ἑαυτῶν ὄνομα πρὸ τοῦ § διασπαρῆναι ἐπὶ προσώπου πάσης § L τῆς γῆς. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 11:19 | θηατέρnς, :: καὶ ἔζησεν Φάλεκ μετὰ τὸ γεννῆσαι αὐτὸν τὸν Ῥαγαὺ διακόσια ἐννέα ἔτη, καὶ ἐγέννησεν υἱοὺς καὶ θηατέρnς, καὶ ἀπέθανεν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 11:31 | γυmῖκα :: καὶ ἔλαβεν Θορὰ τὸν Ἁβρὰμ τὸν υἱὸν αὐτοῦ καὶ τὸν Λὼτ υἱὸν Ἁρρόν, υἱὸν τοῦ υἱοῦ αὐτοῦ, καὶ τὴν Σάραν τὴν νύμφην αὐτοῦ, γυmῖκα τοῦ υἱοῦ αὐτοῦ, καὶ ἐξήγαγεν αὐτοὺς ἐκ τῆς χώρας τῶν Χαλδαίων πορ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:14 | Μrπτον, :: ἐγένετο δὲ ἡνίκα εἰσῆλθεν Ἀβράμ εἰς Μrπτον, ἰδόντες οἱ Αἰγύπτιοι τὴν γυναῖκα αὐτοῦ ὅτι καλὴ ἦν σφόδρα, |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:15 | αm̓ὴν :: καὶ ἴδον αὐτὴν οἱ ἄρχοντες Φαραὼ καὶ ἐπῄνεσαν αm̓ὴν πρὸς Φαραὼ καὶ εἰσήγαγον αὐτὴν πρὸς Φαραώ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:16 | αm̓ήν, :: καὶ τῷ Ἁβρὰμ εὑ ἐχρήσαντο δι' αm̓ήν, καὶ ἐγένοντο αὐτῷ πρόβατα καὶ μόσχοι καὶ ὄνοι, παῖδες κα παδσκαι, ἡμίονοι καὶ κάμηλοι. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:15 | αm̓ῆς· :: Εἶρεν δὲ ὁ θεὸς τῷ Ἀβραάμ Σάρα ἡ γυνή σου, οὐ κληθήσεται τὸ ὄνομα αὐτῆς Σάρα, ἀλλὰ Σάρρα ἔσται τὸ ὄνομα αm̓ῆς· |

### mixed-script Greek/Latin tokens: 348

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 8:4 | Áραρἀτ. :: καὶ ἐκάθισεν ἡ κιβωτὸς ἐν μηνὶ τῷ ἑβδόμῳ, ἑβδόμῃ καὶ εἰκάδι τοῦ μηνός, ἐπὶ τὰ ὄρη τὰ Áραρἀτ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 9:1 | IXκαὶ :: IXκαὶ εἶπεν αὐτοῖς Αὐξάνεσθε καὶ πληθύνεσθε, καὶ πληρώσατε τὴν γῆν καὶ κατακυριεύσατε αὐτῆς. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 11:19 | θηατέρnς, :: καὶ ἔζησεν Φάλεκ μετὰ τὸ γεννῆσαι αὐτὸν τὸν Ῥαγαὺ διακόσια ἐννέα ἔτη, καὶ ἐγέννησεν υἱοὺς καὶ θηατέρnς, καὶ ἀπέθανεν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 11:31 | γυmῖκα :: καὶ ἔλαβεν Θορὰ τὸν Ἁβρὰμ τὸν υἱὸν αὐτοῦ καὶ τὸν Λὼτ υἱὸν Ἁρρόν, υἱὸν τοῦ υἱοῦ αὐτοῦ, καὶ τὴν Σάραν τὴν νύμφην αὐτοῦ, γυmῖκα τοῦ υἱοῦ αὐτοῦ, καὶ ἐξήγαγεν αὐτοὺς ἐκ τῆς χώρας τῶν Χαλδαίων πορ |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:14 | Μrπτον, :: ἐγένετο δὲ ἡνίκα εἰσῆλθεν Ἀβράμ εἰς Μrπτον, ἰδόντες οἱ Αἰγύπτιοι τὴν γυναῖκα αὐτοῦ ὅτι καλὴ ἦν σφόδρα, |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:15 | αm̓ὴν :: καὶ ἴδον αὐτὴν οἱ ἄρχοντες Φαραὼ καὶ ἐπῄνεσαν αm̓ὴν πρὸς Φαραὼ καὶ εἰσήγαγον αὐτὴν πρὸς Φαραώ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 12:16 | αm̓ήν, :: καὶ τῷ Ἁβρὰμ εὑ ἐχρήσαντο δι' αm̓ήν, καὶ ἐγένοντο αὐτῷ πρόβατα καὶ μόσχοι καὶ ὄνοι, παῖδες κα παδσκαι, ἡμίονοι καὶ κάμηλοι. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:15 | αm̓ῆς· :: Εἶρεν δὲ ὁ θεὸς τῷ Ἀβραάμ Σάρα ἡ γυνή σου, οὐ κληθήσεται τὸ ὄνομα αὐτῆς Σάρα, ἀλλὰ Σάρρα ἔσται τὸ ὄνομα αm̓ῆς· |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:20 | ’lσμαὴλ :: πεπὶ δὲ ’lσμαὴλ ἰδοὺ ἐπήκουσά σου· καὶ εὐλόγησα αὐτόν, καὶ αὐξάνω αὐτὸν καὶ πληθυνῶ αὐτὸν σφόδρα· δώδεκα ἔθνη γεννήσει, καὶ δώσω αὐτὸν εἰς ἔθνος μέγα. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 27:2 | τελεmῆς :: καὶ εἶπεν Ἴδου γεγήρακα, καὶ οὐ γινώσκω τὴν ἡμέραν τῆς τελεmῆς μου· |

### hyphenated fragments: 340

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 8:22 | κατα- IX :: πάσας τὰς ἡμέρας τῆς γῆς σπέρμα θερισμός, ψῦχος καὶ καῦμα, θέρος καὶ ἔαρ ἡμέραν καὶ νύκτα οὐ κατα- IX |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 9:20 | ἄνθρω- πος :: Καὶ ἤρξατο Νῶε ἄνθρω- πος γεωργὸς γῆς, καὶ ἐφύτευσεν ἀμπελῶνα. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 13:11 | ἐξελἐ- ξατο :: καὶ ἐξελἐ- ξατο ἑαυτῷ Λὼτ πᾶσαν τὴν περίχωρον τοῦ Ἰορδάνου, κα ἀπῆρεν Λὼτ ἀπὸ ἀνατολῶν. καὶ διεχωρίσθησαν ἕκαστος ἀπὸ τοῦ ἀδελφοῦ αὐτοῦ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 15:8 | κλη- ρονομήσω :: εἶπεν δέ Δέσποτα Κύριε, κατὰ τί γνώσομαι ὅτι κλη- ρονομήσω αὐτήν; |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 15:17 | τού- τῶν. :: ἐπεὶ δὲ ἐγίνετο ὁ ἥλιος πρὸς δυσμαῖς, φλὸξ ἐγένετο· καὶ ἰδού κλίβανος καπνιζόμενος καὶ λαμπάδες πυρός, αἳ διῆλθον ἀνὰ μέσον τῶν διχοτομημάτων τού- τῶν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 16:11 | ταπει- νώσει :: καὶ εἶπεν αὐτῇ ὁ ἄγγελος κυρίου ἰδοὺ σὺ ἐν γαστρὶ ἔχεις, καὶ τέξῃ υἱόν, καὶ κολέσεις τὸ ὄνομα αὐτοῦ Ἰσμαήλ, ὅτι ἐπήκουσεν κύριος τῆ ταπει- νώσει σου. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:10 | ἀρσε- νικόν. :: καὶ αὕτη ἡ διαθήκη διατηρήσεις ἀνὰ μέσον ἐμοῦ καὶ ὑμῶν, καὶ ἀνὰ μέσον τοῦ σπέρματός σου μετὰ σὲ ¶ εἰς τὰς γενεὰς αὐτῶν· περιτμηθήσεται ὑμῶν πᾶν ἀρσε- νικόν. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:22 | συνετέ- δὲ :: συνετέ- δὲ λαλῶν πρὸς αὐτόν, καὶ ἀνέβη ὁ θεὸς ἀπὸ Ἁβραάμ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 17:25 | περι- τὴν :: Ἱσμαὴλ δὲ ὁ υἱὸς αὐτοῦ ἐτῶν δέκα τριῶν ἦν, ἡνίκα περι- τὴν σάρκα τῆς ἀκροβυστίας αὐτοῦ. |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 18:8 | βού- τυρον :: ἑλαβεν δὲ βού- τυρον καὶ γάλα καὶ τὸ μοσχάριον ὃ ἐποίησεν, κα παρέθηκεν αὐτοῖς, καὶ ἐφάγοσαν· αὐτὸς δὲ παρειστήκει αὐτοῖς ὑπὸ τὸ δένδρον. |

### uncertain glyph strings: 12

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml | 43:23 | εἶ(??)εν δὲ αὐτοῖς ὁ ἄνθρωπος ἵλεως ὑμῖν, μὴ φοβεῖσθε· ὁ θεὸς ὑμῶν καὶ ὁ θεὸς τῶν πατέρων ὑμῶν ἒδωκεν ὑμῖν θησαυροὺς ἐν τοῖς μαρσίπποις ὑμῶν./ τὸ δὲ ἀργύριον ὑμῶν εὐδοκιμοῦν ἀπέχω. καὶ ἐξήγαγεν πρὸς α |
| data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml | 15:23 | καθὰ συνέταξενύριος Κύριος πρὸς ὑμᾶς ἐν χειρὶ (??) ἀπὸ τῆς ἡμέρας ἧς συνέταξεν κύριος πρὸς ὑμᾶς καὶ ἐπέεἰς τὰς γενεὰς ὑμῶν· |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | 2:1 | καὶ ἀνέβη ἄγγελος κυρίου ἀπὸ Γαλγὰλ ἐπὶ τὸν κλαυθμῶνα καὶ ἐπὶ Βαιθὴλ καὶ ἐπὶ τὸν οἶκον Ἰσραήλ, καὶ εἶπεν πρὸς αὐτούς τάδε λέγει Κύος Ἀβεβίβασα ὑμᾶς ἐξ Αἰγύπτου, κοὶ εἰσήγαγον εἰς εἰς τὴν γῆν (??) ὤμοσ |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | 3:4 | καὶ ἀνέστη καὶ ἐπορεύθη εἰς Γαβαὼν θῦσαι ἐκεῖ, ὅτι αὐτὴ ὑψηλοτάτη καὶ μ(??)γάλη· χιλίαν ολοκαύτωσιν ἀνήνεγκεν Σαλωμὼν ἐπὶ τὸ θυσιαστήριον ἐν Γαβαών. |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | 16:16 | ¹6ὅτι μικρὸν πᾶσα θυσία εἰ ὀσμὴν εὐωδίας, καὶ ἐλάχιστον πᾶν ?? ?? εἰς ὁλοκαύτωμά σοι ὁ δὲ φοβούμενος τὸν ?? ?? μέγας διὰ παντός. |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | 16:17 | ¹7οὐαὶ ἔθνεσιν ?? τῷ γένει μου· Κύριος Παντοκράτωρ ἐκδικήσει αὐτοὺς ἐν ἡμέρᾳ κρίσεως, (21)δοῦναι πῦρ καὶ σκώληκας εἰς σάρκας αὐτῶν, καὶ κλαύσονται ἐν αἰσθήσει ἕως αἰῶνος. |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | 3:14 | αὐτὸς Κύριος εἰς κρίσιν ἥξει μετὰ τῶν πρεσβυτέρων τοῦ λαοῦ καὶ μετὰ τῶν ἀρχόντων αὐτοῦ. ὑμεῖς δέ τί ἐνεπυρίσατε τὸν ἀμπελῶνά μου, καὶ ἡ ἁρπαγὴ τοῦ πτωχοῦ?? ἐν τοῖς οἴκοις ὑμῶν; |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | 22:14 | καὶ ἀνακεκαλυμμένα ?? ἐστιν ἐν τοῖς ὠσὶν Κυρίου σαβαώθ, ὅτι οὐκ ἀφεθήσεται ὑμῖν αὕτη ἡ ἁμαρτία ἕως ἂν ἀποθάνητε. |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | 3:52 | ⁵²Εὐλογητὸς εἶ, Κύριε ὁ θ??ὸς τῶν πατέρων ἡμῶν, καὶ αἰνετὸς καὶ ὑπερυψούμενος εἰς τοὺς αἰῶνας· καὶ εὐλογημένον τὸ ὄνομα τῆς δόξης σου τὸ ἅγιον, καὶ ὑπεραινετὸν καὶ ὑπερυψούμενον¶ εἰς πάντας τοὺς αἰῶνα |

### other XML notes: 3

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml | 4:30 | V |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | 1:20 | Syr |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | 3:27 | Syr |

### superscript / note marker candidates: 438

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 3:24 | ¹ :: καὶ υἱοὶ Ἐλειθενάν· ¹Οδολιὰ καὶ Ἀσεὶβ καὶ Φορὰ καὶ Ἰακοὺν καὶ Ἰωανάν καὶ Δαλααιὰ καὶ Μανεί, ἑπτά. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 8:35 | ᵇ :: καὶ υἱοὶ Μιχιά· Φιθὼν καὶ Μελχὴλ καὶ ᵇερέε καὶ Ζάκ. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 12:7 | ⁸ :: καὶ Ἐλιὰ καὶ Ζαβιδιὰ υἱοὶ Ῥαὰμ καὶ οἱ τοῦ Γεδώρ. ⁸καὶ ἀπὸ τοῦ Γεδδεὶ ἐχωρίσθησαν πρὸς Δαυεὶδ ἀπὸ τῆς ἐρήμου ἰσχυροὶ δυνατοὶ ἄνδρες παρατάξεως πολέμου, αἴροντες θυρεοὺς καὶ δόρατα, καὶ πρόσωπον λέ |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:11 | ¹ / ¹ :: ¹¹ζητήσατε καὶ ἰσχύσατε, ζητήσατε τὸ πρόσωπον αὐτοῦ διὰ παντός. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:21 | ² / ¹ :: ²¹οὐκ ἀφῆκεν ἄνδρα τοῦ δυναστεῦσαι αὐτούς, καὶ ἤλεγξεν περὶ αὐτῶν βασιλεῖς |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:23 | ² / ³ :: ²³ἄσατε τῷ κυρίῳ πᾶσα ἡ γῆ, ἀναγγείλατε ἐξ ἡμέρας εἰς ἡμέραν σωτηρίαν αὐτοῦ. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:31 | ³ / ¹ :: ³¹εὐφρανθήτω ὁ οὐρανὸς καὶ ἀγαλλιάσθω ἡ γῆ, καὶ εἰπάτωσαν ἐυ τοῖς ἔθνεσιν Κύριος βασιλεύων. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:32 | ³ / ² :: ³²ββοββήσει ἡ θάλασσα σὺν τῷ πληρώματι· ξύλον ἀγροῦ καὶ πάντα τὰ ἐν αὐτῷ. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:33 | ³ / ³ :: ³³τότε εὐφρανθήσεται τὰ ξύλα τοῦ δρυμοῦ ἀπὸ προσώπου Κυρίου, ὅτι ἥλθεν κρῖναι τὴν γῆν. |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 20:2 | ³ :: καὶ ἔλαβεν Δαυεὶδ τὸν στέφανον Μολχὸλ βασιλέως αὐτῶν ἀπὸ τῆς κεφαλῆς αὐτοῦ, καὶ εὑρέθη ὁ σταθμὸς αὐτοῦ τάλαντον χρυσίου, καὶ ἐν αὐτῷ λίθος τίμιος, καὶ ἦν ἐπὶ τὴν κεφαλὴν Δαυείδκαὶ σκῦλα τῆς πόλεω |

### literal Unicode escape labels: 12

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | 17:9 | U+03F2 / U+03F2 / U+03F2 / U+03F2 :: Ἐνταῦθα φέρων ἱερεύU+03F2, καὶ φυνὴ φεραιά, καὶ ἑπτὰ παῖδεU+03F2 ἐνκεκήδευνται διὰ τυράννου βίδν, τὴν Ἐβρδίων πολιτίαν καταλῦU+03F2αι θέλοντοU+03F2. |
| data/tlg0527/tlg026/tlg0527.tlg026.1st1K-grc1.xml | 17:10 | U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 / U+03F2 :: οἳ καὶ ἐξεδίκηU+03F2αν τὸ ἔθνοU+03F2 εἰU+03F2 θεὸν ἀφορῶντεU+03F2, καὶ μέχρι θανάτου τὰU+03F2 βαU+03F2άνουU+03F2 ὑπομίναντεU+03 |

### replacement characters: 0

No occurrences detected by this check.

### control characters: 0

No occurrences detected by this check.

### XML leftovers in main text: 0

No occurrences detected by this check.

### isolated digit tokens: 22

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | 8:21 | 2 :: ἐὰν δὲ μὴ βούλῃ ἐξαποστἑλͅαι τὸν λαόν μου, ἰδοὺ ἐγὼ ἑπαποστἑλλω ἐπὶ σὲ καὶ ἐπὶ τοὺς θεράποντάς σου καὶ ἐπὶ τὸν λαόν σου καὶ ἐπὶ τοὺς οἴκους ὑμῶν κυνόμυιαν, καὶ πλησθήσονται αἱ οἰκίαι τῶν Αἰγυπτίω |
| data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml | 39:1 | 1 :: 1 Πᾶν τὸ χρυσίον ὃ κατειργάσθη εἰς τὰ ἔργα κατὰ πᾶσαν τὴν ἐργασίαν τῶν ἁγίων ἐγένετο χρυσίου τοῦ τῆς ἀπαρχῆς, ἐννέα καὶ εἴκοσι τάλαντα καὶ ἑπτακόσιοι εἴκοσι σίκλοι, κατὰ τὸν σίκλον τὸν ἅγιον. |
| data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml | 18:8 | 13 / 1 / 2 / 3 / 4 / 5 / 6 / 7 :: καὶ ἦλθον οἱ πέντε ἄνδρες πρὸς τοὺς ἀδελφοὺς αὐτῶν εἰς Σαραὰ καὶ Ἐσθαόλ, καὶ εἶπον τοῖς ἀδελφοῖς αὐτῶν Tt 13 Μειχα Α \| αγαθυνει] ἠγαθοποίησεν Α \| κύριος ἐμοὶ] με κݲςݲ |
| data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml | 16:10 | 10 :: 10 αἰνεῖτε ἐν ὀνόματι ἁγίῳ αὐτοῦ, εὐφρανθήσεται καρδία ζητοῦσα τὴν εὐδοκίαν αὐτοῦ. |
| data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml | 6:12 | 13 :: καὶ ὡς ἴδαν αὐτοὺς οἱ ἄνδρες τῆς πόλεως ἐπὶ τὴν κορυφὴν τοῦ ὄρους, ἀνέλαβον τὰ ὅπλα αὐτῶν καὶ ἐπῆλθον ἔξω τῆς πόλεως ἐπὶ τὴν κορυφὴν τοῦ ὄρους· καὶ πᾶς ἀνὴρ σφεν- δονήτης διεκράτησαν τὴν ἀνάβασι |
| data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml | 1:3 | 3 :: §³καὶ ὀσμὴ μύρων σου ὑπέρ πάντα τὰ 3 ἀρώματα· μύρον ἐκκενωθὲν ὄνομά σου. διὰ τοῦτο νεάνιδες ἠγάπησάν σε, |
| data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml | 19:17 | 17 :: στόμα δέ μου ἐδέετο, 17 καὶ ἱκέτευον τὴν γυναῖκά μου, προσεκαλούμην δὲ κολακεύων υἱοὺς παλλακίδων μου· |
| data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | 11:8 | 8 :: ἔδωκας αὐτοῖς δαψιλὲς ὕδωρ ἀνελπίστως, 8 δείξας διὰ τοῦ τότε δίψους πῶς τοὺς ὑπεναντίους ἐκόλασας. |
| data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml | 26:28 | 1 :: Επὶ 1 δυσὶ λελύπηται ἡ καρδία μου, καὶ ἐπὶ τῷ τρίτῳ θυμός μοι ἐπῆλθεν· (26)ἀνὴρ πολεμιστὴς ὑστερῶν δι᾿ νδειαν, καὶ ἄνδρες συνετοὶ ἐὰν σκυβαλισθῶσιν, (27)ἐπανάγων ἀπὸ δικαιοσύνης ἐπὶ ἁμαρτίαν· ὁ κ |
| data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml | 9:9 | 10 :: καὶ γνώσονται πᾶς ὁ λαὸς τοῦ Ἐφράιμ καὶ οἱ καθήμενοι ἐν Σαμαρείᾳ, ἐφʼ ὕβρει καὶ ὑψηλῇ καρδίᾳ λέγοντες 10 ΙΙλίνθοι πεπτώκασιν, ἀλλὰ δεῦτε λαξεύσωμεν λίθους, καὶ κόψωμεν συκαμίνους καὶ κέδρους, κα |

### empty verses: 4

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml | 25:19 |  |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | 13:1 |  |
| data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml | 18:1 |  |
| data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml | 3:1 |  |

### placeholder verse candidates: 0

No occurrences detected by this check.

### unparsed token rows: 0

No occurrences detected by this check.

### invalid XML: 0

No occurrences detected by this check.

### nonstandard / zero references: 352

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 15:59a | Θεκὼ καὶ Ἐφράθα, αὕτη ἐστὶν καὶ Φαγὼρ καὶ Αἰτὰν καὶ Κουλὸν καὶ Τατὰμ καὶ Ἐωβὴς καὶ Καρὲμ Γαλὲμ καὶ Θεθὴρ καὶ Μανοχώ, πόλεις ἕνδεκα καὶ αἱ κῶμαι αὐτ’ |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 19:48a | καὶ οὐκ ἐξέθλιψαν οἱ υἱοὶ Δὰν τὸν Ἀμορραῖον τὸν θλίβοντα αὐτοὺς ἐν τῷ ὄρει· καὶ οὐκ εἴων αὐτοὺς οἱ Ἀμορραῖοι καταβῆναι εἰς τὴν κοιλάδα, καὶ ἔθλιψαν ἀπ’ αὐτῶν τὸ ὅριον τῆς μερίδος αὐτῶν. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 19:47a | καὶ ὁ Ἀμορραῖος ὑπέμεινεν τοῦ κατοικεῖν ἐν Ἐλὼμ καὶ ἐν Σαλαμείν· καὶ ἐβαρύνθη ἡ χεὶρ τοῦ Ἐφράιμ ἐπ’ αὐτούς, καὶ ἐγένοντο αὐτοῖς εἰς φόρον. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 21:42a | και συνετέλεσεν Ἰησοῦς διαμερίσας τὴν γῆν ἐν τοῖς ὁρίοις αὐτῶν. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 21:42b | καὶ ἔδωκαν οἱ υἱοὶ Ἰσραὴλ μερίδα τῷ Ἰησοῖ κατὰ πρόσταγμα κυρίου· ἔδωκαν αὐτῷ τὴν πόλιν ἢν ᾐτήσατο· τὴν Θαμ’. νασάραχ ἔδωκαν αὐτῷ ἐν τῷ ὄρει Ἐφράιμ. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 21:42c | καὶ ᾠκοδόμησεν Ἰησοῦς τὴν πόλιν καὶ ᾤκησεν ἐν αὐτῇ· |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 21:42d | καὶ ἔλαβεν Ἰησοῦς τὰς μαχαίρας τὰς πετρίνας, ἐν αἷς περιέτεμεν τοὺς υἱούς Ἰσραὴλ τοὺς γενομένους ἐν τῇ ὁδῷ ἐν τῇ ἐρήμῳ, καὶ ἔθηκεν αὐτὰς ἐν Θαμνασαχαράθ. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 24:30a | ἐκεῖ ἔθηκαν μετ’ αὐτοῦ εἰς τὸ μνῆμα, εἰς ὃ ἔθαψαν αὐτὸν ἐκεῖ, τἀς μαχαίρας τὰς πετρίνας ἐν αἷς περιέτεμεν τούς υἱοὺς Ἰσραὴλ ἐν Γαλγάλοις, ὅτε ἐξήγαγεν αὐτοὺς ἐξ Αἰγύπτου καθὰ συνέταξεν αὐτοῖς κύριος·  |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 24:33a | ἐν ἐκείνη τῆ ἡμέρᾳ λαβόντες οἱ υἱοὶ Ἰσραὴλ τὴν κιβωτὸν τοῦ θεοῦ περιεφέροσαν ἐν ἑαυτοῖς· καὶ Φεινεὲς ἱεράτευσεν ἀντὶ Ἐλεαζὰρ τοῦ πατρὸς αὐτοῦ ἕως ἀπέθανεν, καὶ κατωρύγη ἐν Γαβαὰρ τῇ ἑαυτῶν. |
| data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml | 24:33b | b οἱ δὲ υἱοὶ Ἰσραὴλ ἀπήλθοσαν ἕκαστος εἰς τὸν τόπον αὐτῶν καὶ εἰς τήν ἑαυτῶν πόλιν. καὶ ἐσέβοντο οἱ υἱοὶ Ἰσραὴλ τὴν Ἀστάρτην καὶ Ἀσταρὼθ καὶ τοὺς θεοὺς τῶν ἐθνῶν τῶν κύκλω αὐτῶν· καὶ παρέδωκεν αὐτοὺς  |

### main text outside verse containers: 181

| File | Reference | Observed sample |
| --- | --- | --- |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 14 | Ψαλμὸς τῷ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 15 | Στηλογραφία τῷ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 16 | Προσευχὴ τοῦ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 22 | Ψαλμὸς τῷ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 23 | Ψαλμὸς τῷ Δαυείδ· τῆς μιᾶς σαββάτων. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 24 | Ψαλμὸς τῷ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 25 | Τοῦ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 26 | Τοῦ Δαυείδ, πρὸ τοῦ χρισθῆναι. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 27 | Τοῦ Δαυείδ. |
| data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml | 28 | Ψαλμὸς τῷ Δαυείδ· ἐξοδίου σκηνῆς. |

## B structure versus canon, grouped by cause


### a Psalms


PSA — data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml; chapters 151 vs canon 150. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 6 | 6 | 6 |  |  |
| 2 | 2 | 12 | 12 | 12 |  |  |
| 3 | 3 | 9 | 9 | 8 |  |  |
| 4 | 4 | 9 | 9 | 8 |  |  |
| 5 | 5 | 13 | 13 | 12 |  |  |
| 6 | 6 | 11 | 11 | 10 |  |  |
| 7 | 7 | 18 | 18 | 17 |  |  |
| 8 | 8 | 10 | 10 | 9 |  |  |
| 9 | 9 | 39 | 39 | 20 |  |  |
| 10 | 10 | 7 | 7 | 18 |  |  |
| 11 | 11 | 9 | 9 | 7 |  |  |
| 12 | 12 | 6 | 6 | 8 |  |  |
| 13 | 13 | 7 | 7 | 6 |  |  |
| 14 | 14 | 5 | 5 | 7 |  |  |
| 15 | 15 | 11 | 11 | 5 |  |  |
| 16 | 16 | 15 | 15 | 11 |  |  |
| 17 | 17 | 51 | 51 | 15 |  |  |
| 18 | 18 | 15 | 15 | 50 |  |  |
| 19 | 19 | 10 | 10 | 14 |  |  |
| 20 | 20 | 14 | 14 | 9 |  |  |
| 21 | 21 | 32 | 32 | 13 |  |  |
| 22 | 22 | 6 | 6 | 31 |  |  |
| 23 | 23 | 10 | 10 | 6 |  |  |
| 24 | 24 | 21 | 22 | 10 | 14 |  |
| 25 | 25 | 12 | 12 | 22 |  |  |
| 26 | 26 | 14 | 14 | 12 |  |  |
| 27 | 27 | 9 | 9 | 14 |  |  |
| 28 | 28 | 11 | 11 | 9 |  |  |
| 29 | 29 | 13 | 13 | 11 |  |  |
| 30 | 30 | 25 | 25 | 12 |  |  |
| 31 | 31 | 11 | 11 | 24 |  |  |
| 32 | 32 | 22 | 22 | 11 |  |  |
| 33 | 33 | 23 | 23 | 22 |  |  |
| 34 | 34 | 28 | 28 | 22 |  |  |
| 35 | 35 | 13 | 13 | 28 |  |  |
| 36 | 36 | 40 | 40 | 12 |  |  |
| 37 | 37 | 23 | 23 | 40 |  |  |
| 38 | 38 | 14 | 14 | 22 |  |  |
| 39 | 39 | 18 | 18 | 13 |  |  |
| 40 | 40 | 14 | 14 | 17 |  |  |
| 41 | 41 | 12 | 12 | 13 |  |  |
| 42 | 42 | 5 | 5 | 11 |  |  |
| 43 | 43 | 26 | 27 | 5 | 8 |  |
| 44 | 44 | 18 | 18 | 26 |  |  |
| 45 | 45 | 12 | 12 | 17 |  |  |
| 46 | 46 | 10 | 10 | 11 |  |  |
| 47 | 47 | 14 | 15 | 9 | 7 |  |
| 48 | 48 | 21 | 21 | 14 |  |  |
| 49 | 49 | 23 | 23 | 20 |  |  |
| 50 | 50 | 21 | 21 | 23 |  |  |
| 51 | 51 | 11 | 11 | 19 |  |  |
| 52 | 52 | 7 | 7 | 9 |  |  |
| 53 | 53 | 9 | 9 | 6 |  |  |
| 54 | 54 | 23 | 24 | 7 | 6 |  |
| 55 | 55 | 14 | 14 | 23 |  |  |
| 56 | 56 | 12 | 12 | 13 |  |  |
| 57 | 57 | 12 | 12 | 11 |  |  |
| 58 | 58 | 18 | 18 | 11 |  |  |
| 59 | 59 | 14 | 14 | 17 |  |  |
| 60 | 60 | 9 | 9 | 12 |  |  |
| 61 | 61 | 13 | 13 | 8 |  |  |
| 62 | 62 | 12 | 12 | 12 |  |  |
| 63 | 63 | 10 | 11 | 11 | 3 |  |
| 64 | 64 | 14 | 14 | 10 |  |  |
| 65 | 65 | 20 | 20 | 13 |  |  |
| 66 | 66 | 8 | 8 | 20 |  |  |
| 67 | 67 | 36 | 36 | 7 |  |  |
| 68 | 68 | 37 | 37 | 35 |  |  |
| 69 | 69 | 6 | 6 | 36 |  |  |
| 70 | 70 | 24 | 24 | 5 |  |  |
| 71 | 71 | 20 | 20 | 24 |  |  |
| 72 | 72 | 28 | 28 | 20 |  |  |
| 73 | 73 | 23 | 23 | 28 |  |  |
| 74 | 74 | 11 | 11 | 23 |  |  |
| 75 | 75 | 13 | 13 | 10 |  |  |
| 76 | 76 | 21 | 21 | 12 |  |  |
| 77 | 77 | 72 | 72 | 20 |  |  |
| 78 | 78 | 13 | 13 | 72 |  |  |
| 79 | 79 | 20 | 20 | 13 |  |  |
| 80 | 80 | 17 | 17 | 19 |  |  |
| 81 | 81 | 8 | 8 | 16 |  |  |
| 82 | 82 | 19 | 19 | 8 |  |  |
| 83 | 83 | 13 | 13 | 18 |  |  |
| 84 | 84 | 14 | 14 | 12 |  |  |
| 85 | 85 | 17 | 17 | 13 |  |  |
| 86 | 86 | 7 | 7 | 17 |  |  |
| 87 | 87 | 19 | 19 | 7 |  |  |
| 88 | 88 | 53 | 84 | 18 | 48,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83 |  |
| 89 | 89 | 17 | 17 | 52 |  |  |
| 90 | 90 | 16 | 16 | 17 |  |  |
| 91 | 91 | 15 | 15 | 16 |  |  |
| 92 | 92 | 5 | 5 | 15 |  |  |
| 93 | 93 | 23 | 23 | 5 |  |  |
| 94 | 94 | 11 | 11 | 23 |  |  |
| 95 | 95 | 13 | 13 | 11 |  |  |
| 96 | 96 | 12 | 12 | 13 |  |  |
| 97 | 97 | 9 | 9 | 12 |  |  |
| 98 | 98 | 9 | 9 | 9 |  |  |
| 99 | 99 | 5 | 5 | 9 |  |  |
| 100 | 100 | 8 | 8 | 5 |  |  |
| 101 | 101 | 29 | 29 | 8 |  |  |
| 102 | 102 | 22 | 22 | 28 |  |  |
| 103 | 103 | 35 | 35 | 22 |  |  |
| 104 | 104 | 45 | 45 | 35 |  |  |
| 105 | 105 | 48 | 48 | 45 |  |  |
| 106 | 106 | 43 | 43 | 48 |  |  |
| 107 | 107 | 14 | 14 | 43 |  |  |
| 108 | 108 | 31 | 31 | 13 |  |  |
| 109 | 109 | 7 | 7 | 31 |  |  |
| 110 | 110 | 10 | 10 | 7 |  |  |
| 111 | 111 | 10 | 10 | 10 |  |  |
| 112 | 112 | 9 | 9 | 10 |  |  |
| 113 | 113 | 26 | 26 | 9 |  |  |
| 114 | 114 | 9 | 9 | 8 |  |  |
| 115 | 115 | 9 | 10 | 18 | 6 |  |
| 116 | 116 | 2 | 2 | 19 |  |  |
| 117 | 117 | 28 | 29 | 2 | 4 |  |
| 118 | 118 | 166 | 176 | 29 | 19,28,29,30,32,34,35,51,131,133 |  |
| 119 | 119 | 6 | 7 | 176 | 4 |  |
| 120 | 120 | 8 | 8 | 7 |  |  |
| 121 | 121 | 9 | 9 | 8 |  |  |
| 122 | 122 | 4 | 4 | 9 |  |  |
| 123 | 123 | 8 | 8 | 4 |  |  |
| 124 | 124 | 5 | 5 | 8 |  |  |
| 125 | 125 | 6 | 6 | 5 |  |  |
| 126 | 126 | 5 | 5 | 6 |  |  |
| 127 | 127 | 6 | 6 | 5 |  |  |
| 128 | 128 | 8 | 8 | 6 |  |  |
| 129 | 129 | 8 | 8 | 8 |  |  |
| 130 | 130 | 3 | 3 | 8 |  |  |
| 131 | 131 | 18 | 18 | 3 |  |  |
| 132 | 132 | 3 | 3 | 18 |  |  |
| 133 | 133 | 3 | 3 | 3 |  |  |
| 134 | 134 | 21 | 21 | 3 |  |  |
| 135 | 135 | 25 | 26 | 21 | 23 |  |
| 136 | 136 | 9 | 9 | 26 |  |  |
| 137 | 137 | 8 | 8 | 9 |  |  |
| 138 | 138 | 24 | 24 | 8 |  |  |
| 139 | 139 | 14 | 14 | 24 |  |  |
| 140 | 140 | 10 | 10 | 13 |  |  |
| 141 | 141 | 8 | 8 | 10 |  |  |
| 142 | 142 | 12 | 12 | 7 |  |  |
| 143 | 143 | 15 | 15 | 12 |  |  |
| 144 | 144 | 21 | 21 | 15 |  |  |
| 145 | 145 | 10 | 10 | 21 |  |  |
| 146 | 146 | 11 | 11 | 10 |  |  |
| 147 | 147 | 9 | 9 | 20 |  |  |
| 148 | 148 | 14 | 14 | 14 |  |  |
| 149 | 149 | 9 | 9 | 9 |  |  |
| 150 | 150 | 6 | 6 | 6 |  |  |
| 151 | 151 | 7 | 7 | absent |  |  |

### b Jeremiah


JER — data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml; chapters 52 vs canon 52. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 19 | 19 | 19 |  |  |
| 2 | 2 | 34 | 36 | 37 | 1,6 |  |
| 3 | 3 | 25 | 25 | 25 |  |  |
| 4 | 4 | 31 | 31 | 31 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 32 | 34 | 34 | 1,27 |  |
| 8 | 8 | 20 | 22 | 22 | 11,12 |  |
| 9 | 9 | 26 | 26 | 26 |  |  |
| 10 | 10 | 20 | 25 | 25 | 5,6,7,8,10 | 5a,5b |
| 11 | 11 | 22 | 23 | 23 | 7 |  |
| 12 | 12 | 17 | 17 | 17 |  |  |
| 13 | 13 | 27 | 27 | 27 |  |  |
| 14 | 14 | 22 | 22 | 22 |  |  |
| 15 | 15 | 21 | 21 | 21 |  |  |
| 16 | 16 | 21 | 21 | 21 |  |  |
| 17 | 17 | 23 | 27 | 27 | 1,2,3,4 |  |
| 18 | 18 | 23 | 23 | 23 |  |  |
| 19 | 19 | 15 | 15 | 15 |  |  |
| 20 | 20 | 18 | 18 | 18 |  |  |
| 21 | 21 | 14 | 14 | 14 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 38 | 40 | 40 | 30,31 |  |
| 24 | 24 | 10 | 10 | 10 |  |  |
| 25 | 25 | 19 | 19 | 38 |  |  |
| 26 | 26 | 26 | 28 | 24 | 7,26 |  |
| 27 | 27 | 46 | 46 | 22 |  |  |
| 28 | 28 | 60 | 64 | 17 | 45,46,47,48 |  |
| 29 | 29 | 23 | 23 | 32 |  |  |
| 30 | 30 | 16 | 16 | 24 |  |  |
| 31 | 31 | 44 | 44 | 40 |  |  |
| 32 | 32 | 24 | 24 | 44 |  |  |
| 33 | 33 | 24 | 24 | 26 |  |  |
| 34 | 34 | 18 | 18 | 22 |  |  |
| 35 | 35 | 17 | 17 | 19 |  |  |
| 36 | 36 | 27 | 32 | 32 | 16,17,18,19,20 |  |
| 37 | 37 | 20 | 24 | 21 | 10,11,15,22 |  |
| 38 | 38 | 40 | 40 | 28 |  |  |
| 39 | 39 | 44 | 44 | 18 |  |  |
| 40 | 40 | 13 | 13 | 16 |  |  |
| 41 | 41 | 22 | 22 | 18 |  |  |
| 42 | 42 | 19 | 19 | 22 |  |  |
| 43 | 43 | 32 | 32 | 13 |  |  |
| 44 | 44 | 21 | 21 | 30 |  |  |
| 45 | 45 | 28 | 28 | 5 |  |  |
| 46 | 46 | 8 | 18 | 28 | 4,5,6,7,8,9,10,11,12,13 |  |
| 47 | 47 | 16 | 16 | 7 |  |  |
| 48 | 48 | 17 | 18 | 47 | 11 | 11s |
| 49 | 49 | 22 | 22 | 39 |  |  |
| 50 | 50 | 13 | 13 | 46 |  |  |
| 51 | 51 | 35 | 35 | 64 |  |  |
| 52 | 52 | 27 | 34 | 34 | 2,3,9,15,28,29,30 |  |

### c Esther/Daniel


EST — data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml; chapters 10 vs canon 10. Nonpositive/nonnumeric chapters: [{"chapter":"prologue","count":17,"max":17,"nonstandard":[],"holes":[]}]

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 15 | 15 | 15 |  | 1a,2a,3a,4a,5a,6a,7a |
| 4 | 4 | 16 | 17 | 46 | 6 | 1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,1a1,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a,25a,26a,27a,28a,29a,30a,1b,2b,3b,4b,5b,6b,7b,8b,9b,10b,11b,12b,13b,14b,15b,16b |
| 5 | 5 | 12 | 14 | 14 | 1,2 |  |
| 6 | 6 | 13 | 13 | 14 |  |  |
| 7 | 7 | 10 | 10 | 10 |  |  |
| 8 | 8 | 17 | 17 | 17 |  | 1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,11a,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a |
| 9 | 9 | 30 | 31 | 32 | 5 |  |
| 10 | 10 | 11 | 11 | 14 |  | 1a,2a,3a |

DAN — data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml; chapters 12 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 49 | 49 | 49 |  |  |
| 3 | 3 | 100 | 100 | 97 |  |  |
| 4 | 4 | 28 | 34 | 37 | 3,4,5,6,31,32 | 14a,30a,30b,30c,34a,34b,34c |
| 5 | 5 | 22 | 31 | 31 | 14,15,18,19,20,21,22,24,25 |  |
| 6 | 6 | 27 | 28 | 28 | 8 | 12a |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 27 | 27 | 27 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 21 | 21 | 21 |  |  |
| 11 | 11 | 45 | 45 | 45 |  |  |
| 12 | 12 | 13 | 13 | 13 |  |  |

DAN — data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml; chapters 12 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 49 | 49 | 49 |  |  |
| 3 | 3 | 98 | 100 | 97 | 71,72 |  |
| 4 | 4 | 34 | 34 | 37 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 28 | 28 | 28 |  |  |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 27 | 27 | 27 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 20 | 21 | 21 | 8 |  |
| 11 | 11 | 45 | 45 | 45 |  |  |
| 12 | 12 | 4 | 4 | 13 |  |  |

### d other


GEN — data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml; chapters 50 vs canon 50. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 31 | 31 | 31 |  |  |
| 2 | 2 | 24 | 24 | 25 |  |  |
| 3 | 3 | 24 | 24 | 24 |  |  |
| 4 | 4 | 26 | 26 | 26 |  |  |
| 5 | 5 | 31 | 31 | 32 |  |  |
| 6 | 6 | 22 | 22 | 22 |  |  |
| 7 | 7 | 24 | 24 | 24 |  |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 32 | 32 | 32 |  |  |
| 11 | 11 | 32 | 32 | 32 |  |  |
| 12 | 12 | 20 | 20 | 20 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 24 | 24 | 24 |  |  |
| 15 | 15 | 18 | 18 | 21 |  |  |
| 16 | 16 | 15 | 15 | 16 |  |  |
| 17 | 17 | 27 | 27 | 27 |  |  |
| 18 | 18 | 33 | 33 | 33 |  |  |
| 19 | 19 | 38 | 38 | 38 |  |  |
| 20 | 20 | 18 | 18 | 18 |  |  |
| 21 | 21 | 34 | 34 | 34 |  |  |
| 22 | 22 | 24 | 24 | 24 |  |  |
| 23 | 23 | 20 | 20 | 20 |  |  |
| 24 | 24 | 67 | 67 | 67 |  |  |
| 25 | 25 | 34 | 34 | 34 |  |  |
| 26 | 26 | 35 | 35 | 35 |  |  |
| 27 | 27 | 46 | 46 | 46 |  |  |
| 28 | 28 | 22 | 22 | 22 |  |  |
| 29 | 29 | 35 | 35 | 35 |  |  |
| 30 | 30 | 43 | 43 | 43 |  |  |
| 31 | 31 | 54 | 55 | 55 | 51 |  |
| 32 | 32 | 32 | 32 | 32 |  |  |
| 33 | 33 | 20 | 20 | 20 |  |  |
| 34 | 34 | 31 | 31 | 31 |  |  |
| 35 | 35 | 29 | 29 | 29 |  |  |
| 36 | 36 | 42 | 42 | 43 |  |  |
| 37 | 37 | 35 | 35 | 36 |  |  |
| 38 | 38 | 30 | 30 | 30 |  |  |
| 39 | 39 | 23 | 23 | 23 |  |  |
| 40 | 40 | 23 | 23 | 23 |  |  |
| 41 | 41 | 57 | 57 | 57 |  |  |
| 42 | 42 | 38 | 38 | 38 |  |  |
| 43 | 43 | 34 | 34 | 34 |  |  |
| 44 | 44 | 34 | 34 | 34 |  |  |
| 45 | 45 | 27 | 27 | 28 |  |  |
| 46 | 46 | 34 | 34 | 34 |  |  |
| 47 | 47 | 31 | 31 | 31 |  |  |
| 48 | 48 | 22 | 22 | 22 |  |  |
| 49 | 49 | 33 | 33 | 33 |  |  |
| 50 | 50 | 26 | 26 | 26 |  |  |

EXO — data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml; chapters 40 vs canon 40. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 25 | 25 | 25 |  |  |
| 3 | 3 | 22 | 22 | 22 |  |  |
| 4 | 4 | 30 | 31 | 31 | 26 |  |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 32 | 32 | 32 |  |  |
| 9 | 9 | 35 | 35 | 35 |  |  |
| 10 | 10 | 29 | 29 | 29 |  |  |
| 11 | 11 | 10 | 10 | 10 |  |  |
| 12 | 12 | 51 | 51 | 51 |  |  |
| 13 | 13 | 22 | 22 | 22 |  |  |
| 14 | 14 | 31 | 31 | 31 |  |  |
| 15 | 15 | 27 | 27 | 27 |  |  |
| 16 | 16 | 36 | 36 | 36 |  |  |
| 17 | 17 | 12 | 12 | 16 |  |  |
| 18 | 18 | 27 | 27 | 27 |  |  |
| 19 | 19 | 25 | 25 | 25 |  |  |
| 20 | 20 | 26 | 26 | 26 |  |  |
| 21 | 21 | 36 | 36 | 36 |  |  |
| 22 | 22 | 31 | 31 | 31 |  |  |
| 23 | 23 | 33 | 33 | 33 |  |  |
| 24 | 24 | 12 | 12 | 18 |  |  |
| 25 | 25 | 39 | 39 | 40 |  |  |
| 26 | 26 | 37 | 37 | 37 |  |  |
| 27 | 27 | 21 | 21 | 21 |  |  |
| 28 | 28 | 39 | 39 | 43 |  |  |
| 29 | 29 | 45 | 45 | 46 |  |  |
| 30 | 30 | 38 | 38 | 38 |  |  |
| 31 | 31 | 18 | 18 | 18 |  |  |
| 32 | 32 | 35 | 35 | 35 |  |  |
| 33 | 33 | 23 | 23 | 23 |  |  |
| 34 | 34 | 35 | 35 | 35 |  |  |
| 35 | 35 | 35 | 35 | 35 |  |  |
| 36 | 36 | 40 | 40 | 38 |  |  |
| 37 | 37 | 21 | 21 | 29 |  |  |
| 38 | 38 | 27 | 27 | 31 |  |  |
| 39 | 39 | 23 | 23 | 43 |  |  |
| 40 | 40 | 32 | 32 | 38 |  |  |

LEV — data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml; chapters 27 vs canon 27. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 16 | 16 | 16 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 35 | 35 | 35 |  |  |
| 5 | 5 | 19 | 19 | 19 |  |  |
| 6 | 6 | 40 | 40 | 30 |  |  |
| 7 | 7 | 27 | 27 | 38 |  |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 24 | 24 | 24 |  |  |
| 10 | 10 | 20 | 20 | 20 |  |  |
| 11 | 11 | 47 | 47 | 47 |  |  |
| 12 | 12 | 8 | 8 | 8 |  |  |
| 13 | 13 | 59 | 59 | 59 |  |  |
| 14 | 14 | 57 | 57 | 57 |  |  |
| 15 | 15 | 33 | 33 | 33 |  |  |
| 16 | 16 | 34 | 34 | 34 |  |  |
| 17 | 17 | 16 | 16 | 16 |  |  |
| 18 | 18 | 30 | 30 | 30 |  |  |
| 19 | 19 | 37 | 37 | 37 |  |  |
| 20 | 20 | 27 | 27 | 27 |  |  |
| 21 | 21 | 24 | 24 | 24 |  |  |
| 22 | 22 | 33 | 33 | 33 |  |  |
| 23 | 23 | 44 | 44 | 44 |  |  |
| 24 | 24 | 23 | 23 | 23 |  |  |
| 25 | 25 | 55 | 55 | 55 |  |  |
| 26 | 26 | 46 | 46 | 46 |  |  |
| 27 | 27 | 34 | 34 | 34 |  |  |

NUM — data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml; chapters 36 vs canon 36. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 54 | 54 | 54 |  |  |
| 2 | 2 | 34 | 34 | 34 |  |  |
| 3 | 3 | 51 | 51 | 51 |  |  |
| 4 | 4 | 49 | 49 | 49 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 27 | 27 | 27 |  |  |
| 7 | 7 | 89 | 89 | 89 |  |  |
| 8 | 8 | 26 | 26 | 26 |  |  |
| 9 | 9 | 23 | 23 | 23 |  |  |
| 10 | 10 | 36 | 36 | 36 |  |  |
| 11 | 11 | 35 | 35 | 35 |  |  |
| 12 | 12 | 15 | 15 | 16 |  |  |
| 13 | 13 | 34 | 34 | 33 |  |  |
| 14 | 14 | 45 | 45 | 45 |  |  |
| 15 | 15 | 41 | 41 | 41 |  |  |
| 16 | 16 | 50 | 50 | 50 |  |  |
| 17 | 17 | 13 | 13 | 13 |  |  |
| 18 | 18 | 32 | 32 | 32 |  |  |
| 19 | 19 | 22 | 22 | 22 |  |  |
| 20 | 20 | 29 | 29 | 29 |  |  |
| 21 | 21 | 34 | 34 | 35 |  |  |
| 22 | 22 | 41 | 41 | 41 |  |  |
| 23 | 23 | 30 | 30 | 30 |  |  |
| 24 | 24 | 25 | 25 | 25 |  |  |
| 25 | 25 | 18 | 18 | 18 |  |  |
| 26 | 26 | 65 | 65 | 65 |  |  |
| 27 | 27 | 22 | 22 | 23 |  |  |
| 28 | 28 | 31 | 31 | 31 |  |  |
| 29 | 29 | 39 | 39 | 40 |  |  |
| 30 | 30 | 16 | 16 | 16 |  |  |
| 31 | 31 | 54 | 54 | 54 |  |  |
| 32 | 32 | 42 | 42 | 42 |  |  |
| 33 | 33 | 56 | 56 | 56 |  |  |
| 34 | 34 | 29 | 29 | 29 |  |  |
| 35 | 35 | 34 | 34 | 34 |  |  |
| 36 | 36 | 13 | 13 | 13 |  |  |

DEU — data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml; chapters 34 vs canon 34. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 46 | 46 | 46 |  |  |
| 2 | 2 | 37 | 37 | 37 |  |  |
| 3 | 3 | 29 | 29 | 29 |  |  |
| 4 | 4 | 49 | 49 | 49 |  |  |
| 5 | 5 | 33 | 33 | 33 |  |  |
| 6 | 6 | 25 | 25 | 25 |  |  |
| 7 | 7 | 26 | 26 | 26 |  |  |
| 8 | 8 | 20 | 20 | 20 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 22 | 22 | 22 |  |  |
| 11 | 11 | 32 | 32 | 32 |  |  |
| 12 | 12 | 32 | 32 | 32 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 28 | 28 | 29 |  |  |
| 15 | 15 | 23 | 23 | 23 |  |  |
| 16 | 16 | 21 | 21 | 22 |  |  |
| 17 | 17 | 20 | 20 | 20 |  |  |
| 18 | 18 | 19 | 19 | 22 |  |  |
| 19 | 19 | 21 | 21 | 21 |  |  |
| 20 | 20 | 20 | 20 | 20 |  |  |
| 21 | 21 | 21 | 21 | 23 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 23 | 25 | 25 | 2,12 |  |
| 24 | 24 | 22 | 22 | 22 |  |  |
| 25 | 25 | 18 | 19 | 19 | 16 |  |
| 26 | 26 | 19 | 19 | 19 |  |  |
| 27 | 27 | 26 | 26 | 26 |  |  |
| 28 | 28 | 68 | 68 | 68 |  |  |
| 29 | 29 | 29 | 29 | 29 |  |  |
| 30 | 30 | 20 | 20 | 20 |  |  |
| 31 | 31 | 29 | 29 | 30 |  |  |
| 32 | 32 | 52 | 52 | 52 |  |  |
| 33 | 33 | 29 | 29 | 29 |  |  |
| 34 | 34 | 12 | 12 | 12 |  |  |

JOS — data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml; chapters 24 vs canon 24. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  |  |
| 2 | 2 | 24 | 24 | 24 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 27 | 27 | 27 |  |  |
| 7 | 7 | 26 | 26 | 26 |  |  |
| 8 | 8 | 27 | 29 | 35 | 13,26 |  |
| 9 | 9 | 33 | 33 | 27 |  |  |
| 10 | 10 | 42 | 42 | 43 |  |  |
| 11 | 11 | 23 | 23 | 23 |  |  |
| 12 | 12 | 24 | 24 | 24 |  |  |
| 13 | 13 | 32 | 32 | 33 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |
| 15 | 15 | 63 | 63 | 63 |  | 59a |
| 16 | 16 | 10 | 10 | 10 |  |  |
| 17 | 17 | 18 | 18 | 18 |  |  |
| 18 | 18 | 28 | 28 | 28 |  |  |
| 19 | 19 | 51 | 51 | 51 |  | 48a,47a |
| 20 | 20 | 6 | 9 | 9 | 4,5,6 |  |
| 21 | 21 | 45 | 45 | 45 |  | 42a,42b,42c,42d |
| 22 | 22 | 34 | 34 | 34 |  |  |
| 23 | 23 | 16 | 16 | 16 |  |  |
| 24 | 24 | 33 | 33 | 33 |  | 30a,33a,33b |

JDG — data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml; chapters 21 vs canon 21. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 36 | 36 | 36 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 31 | 31 | 31 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 31 | 31 | 31 |  |  |
| 6 | 6 | 40 | 40 | 40 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 35 | 35 | 35 |  |  |
| 9 | 9 | 57 | 57 | 57 |  |  |
| 10 | 10 | 18 | 18 | 18 |  |  |
| 11 | 11 | 40 | 40 | 40 |  |  |
| 12 | 12 | 15 | 15 | 15 |  |  |
| 13 | 13 | 25 | 25 | 25 |  |  |
| 14 | 14 | 20 | 20 | 20 |  |  |
| 15 | 15 | 20 | 20 | 20 |  |  |
| 16 | 16 | 31 | 31 | 31 |  |  |
| 17 | 17 | 13 | 13 | 13 |  |  |
| 18 | 18 | 31 | 31 | 31 |  |  |
| 19 | 19 | 30 | 30 | 30 |  |  |
| 20 | 20 | 48 | 48 | 48 |  |  |
| 21 | 21 | 25 | 25 | 25 |  |  |

RUT — data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 18 | 18 | 18 |  |  |
| 4 | 4 | 22 | 22 | 22 |  |  |

1SA — data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml; chapters 31 vs canon 31. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 28 | 28 | 28 |  |  |
| 2 | 2 | 36 | 36 | 36 |  |  |
| 3 | 3 | 21 | 21 | 21 |  |  |
| 4 | 4 | 21 | 21 | 22 |  |  |
| 5 | 5 | 12 | 12 | 12 |  |  |
| 6 | 6 | 21 | 21 | 21 |  |  |
| 7 | 7 | 17 | 17 | 17 |  |  |
| 8 | 8 | 21 | 21 | 22 |  |  |
| 9 | 9 | 27 | 27 | 27 |  |  |
| 10 | 10 | 27 | 27 | 27 |  |  |
| 11 | 11 | 15 | 15 | 15 |  |  |
| 12 | 12 | 25 | 25 | 25 |  |  |
| 13 | 13 | 21 | 21 | 23 |  |  |
| 14 | 14 | 51 | 51 | 52 |  |  |
| 15 | 15 | 35 | 35 | 35 |  |  |
| 16 | 16 | 23 | 23 | 23 |  |  |
| 17 | 17 | 33 | 54 | 58 | 12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,50 |  |
| 18 | 18 | 19 | 28 | 30 | 2,3,4,5,10,11,17,18,19 |  |
| 19 | 19 | 24 | 24 | 24 |  |  |
| 20 | 20 | 43 | 43 | 42 |  |  |
| 21 | 21 | 15 | 15 | 15 |  |  |
| 22 | 22 | 23 | 23 | 23 |  |  |
| 23 | 23 | 28 | 28 | 29 |  |  |
| 24 | 24 | 23 | 23 | 22 |  |  |
| 25 | 25 | 43 | 43 | 44 |  |  |
| 26 | 26 | 25 | 25 | 25 |  |  |
| 27 | 27 | 12 | 12 | 12 |  |  |
| 28 | 28 | 25 | 25 | 25 |  |  |
| 29 | 29 | 11 | 11 | 11 |  |  |
| 30 | 30 | 31 | 31 | 31 |  |  |
| 31 | 31 | 13 | 13 | 13 |  |  |

2SA — data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml; chapters 24 vs canon 24. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 27 | 27 | 27 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 39 | 39 | 39 |  |  |
| 4 | 4 | 12 | 12 | 12 |  |  |
| 5 | 5 | 25 | 25 | 25 |  |  |
| 6 | 6 | 23 | 23 | 23 |  |  |
| 7 | 7 | 29 | 29 | 29 |  |  |
| 8 | 8 | 18 | 18 | 18 |  |  |
| 9 | 9 | 13 | 13 | 13 |  |  |
| 10 | 10 | 19 | 19 | 19 |  |  |
| 11 | 11 | 27 | 27 | 27 |  |  |
| 12 | 12 | 31 | 31 | 31 |  |  |
| 13 | 13 | 39 | 39 | 39 |  |  |
| 14 | 14 | 33 | 33 | 33 |  |  |
| 15 | 15 | 37 | 37 | 37 |  |  |
| 16 | 16 | 23 | 23 | 23 |  |  |
| 17 | 17 | 29 | 29 | 29 |  |  |
| 18 | 18 | 33 | 33 | 33 |  |  |
| 19 | 19 | 42 | 42 | 43 |  |  |
| 20 | 20 | 26 | 26 | 26 |  |  |
| 21 | 21 | 22 | 22 | 22 |  |  |
| 22 | 22 | 51 | 51 | 51 |  |  |
| 23 | 23 | 38 | 39 | 39 | 30 | 30a,31a |
| 24 | 24 | 25 | 25 | 25 |  |  |

1KI — data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml; chapters 22 vs canon 22. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 53 | 53 | 53 |  |  |
| 2 | 2 | 46 | 46 | 46 |  | 35a,35b,35c,35d,35e,35f,35g,35h,35I,35k,35i,35m,35n,35o,46a,46b,46c,46d,46e,46f,46g,46n,46i,46j,46l |
| 3 | 3 | 28 | 28 | 28 |  |  |
| 4 | 4 | 33 | 33 | 34 |  |  |
| 5 | 5 | 17 | 17 | 18 |  |  |
| 6 | 6 | 34 | 34 | 38 |  |  |
| 7 | 7 | 50 | 50 | 51 |  |  |
| 8 | 8 | 64 | 66 | 66 | 12,13 | 53a |
| 9 | 9 | 17 | 28 | 28 | 15,16,17,18,19,20,21,22,23,24,25 |  |
| 10 | 10 | 33 | 33 | 29 |  |  |
| 11 | 11 | 43 | 43 | 43 |  |  |
| 12 | 12 | 32 | 33 | 33 | 2 | 24a,24b,24c,24d,24e,24f,24g,24h,24i,24j,24k,24l,24m,24n,24o,24p,24q,24r,24s,24t,24u,24x,24y,24z |
| 13 | 13 | 33 | 34 | 34 | 27 |  |
| 14 | 14 | 12 | 31 | 31 | 2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20 |  |
| 15 | 15 | 32 | 34 | 34 | 6,32 |  |
| 16 | 16 | 34 | 34 | 34 |  | 28a,28b,28c,28d,28e,28f,28g,28h |
| 17 | 17 | 24 | 24 | 24 |  |  |
| 18 | 18 | 46 | 46 | 46 |  |  |
| 19 | 19 | 21 | 21 | 21 |  |  |
| 20 | 20 | 27 | 29 | 43 | 11,12 |  |
| 21 | 21 | 43 | 43 | 29 |  |  |
| 22 | 22 | 50 | 54 | 53 | 47,48,49,50 |  |

2KI — data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml; chapters 25 vs canon 25. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  | 18a,18b,18c,18d |
| 2 | 2 | 25 | 25 | 25 |  |  |
| 3 | 3 | 27 | 27 | 27 |  |  |
| 4 | 4 | 44 | 44 | 44 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 33 | 33 | 33 |  |  |
| 7 | 7 | 20 | 20 | 20 |  |  |
| 8 | 8 | 29 | 29 | 29 |  |  |
| 9 | 9 | 37 | 37 | 37 |  |  |
| 10 | 10 | 36 | 36 | 36 |  |  |
| 11 | 11 | 21 | 21 | 21 |  |  |
| 12 | 12 | 21 | 21 | 21 |  |  |
| 13 | 13 | 25 | 25 | 25 |  |  |
| 14 | 14 | 28 | 28 | 29 |  |  |
| 15 | 15 | 38 | 38 | 38 |  |  |
| 16 | 16 | 20 | 20 | 20 |  |  |
| 17 | 17 | 41 | 41 | 41 |  |  |
| 18 | 18 | 37 | 37 | 37 |  |  |
| 19 | 19 | 37 | 37 | 37 |  |  |
| 20 | 20 | 21 | 21 | 21 |  |  |
| 21 | 21 | 26 | 26 | 26 |  |  |
| 22 | 22 | 20 | 20 | 20 |  |  |
| 23 | 23 | 37 | 37 | 37 |  |  |
| 24 | 24 | 20 | 20 | 20 |  |  |
| 25 | 25 | 29 | 30 | 30 | 10 |  |

1CH — data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml; chapters 29 vs canon 29. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 41 | 54 | 54 | 11,12,13,14,15,16,18,19,20,21,22,23,48 |  |
| 2 | 2 | 55 | 55 | 55 |  |  |
| 3 | 3 | 24 | 24 | 24 |  |  |
| 4 | 4 | 43 | 43 | 43 |  |  |
| 5 | 5 | 26 | 26 | 26 |  |  |
| 6 | 6 | 80 | 81 | 81 | 73 |  |
| 7 | 7 | 40 | 40 | 40 |  |  |
| 8 | 8 | 40 | 40 | 40 |  |  |
| 9 | 9 | 44 | 44 | 44 |  |  |
| 10 | 10 | 14 | 14 | 14 |  |  |
| 11 | 11 | 47 | 47 | 47 |  |  |
| 12 | 12 | 39 | 40 | 40 | 8 |  |
| 13 | 13 | 14 | 14 | 14 |  |  |
| 14 | 14 | 17 | 17 | 17 |  |  |
| 15 | 15 | 29 | 29 | 29 |  |  |
| 16 | 16 | 42 | 93 | 43 | 24,39,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92 |  |
| 17 | 17 | 27 | 27 | 27 |  |  |
| 18 | 18 | 17 | 17 | 17 |  |  |
| 19 | 19 | 19 | 19 | 19 |  |  |
| 20 | 20 | 7 | 8 | 8 | 3 |  |
| 21 | 21 | 30 | 30 | 30 |  |  |
| 22 | 22 | 19 | 19 | 19 |  |  |
| 23 | 23 | 32 | 32 | 32 |  |  |
| 24 | 24 | 30 | 31 | 31 | 24 |  |
| 25 | 25 | 31 | 31 | 31 |  |  |
| 26 | 26 | 32 | 32 | 32 |  |  |
| 27 | 27 | 33 | 34 | 34 | 7 |  |
| 28 | 28 | 20 | 21 | 21 | 3 |  |
| 29 | 29 | 30 | 30 | 30 |  |  |

2CH — data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml; chapters 36 vs canon 36. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 18 | 18 | 18 |  |  |
| 3 | 3 | 16 | 17 | 17 | 12 |  |
| 4 | 4 | 22 | 220 | 22 | 20,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219 |  |
| 5 | 5 | 14 | 14 | 14 |  |  |
| 6 | 6 | 42 | 42 | 42 |  |  |
| 7 | 7 | 22 | 22 | 22 |  |  |
| 8 | 8 | 18 | 18 | 18 |  |  |
| 9 | 9 | 31 | 31 | 31 |  |  |
| 10 | 10 | 19 | 19 | 19 |  |  |
| 11 | 11 | 21 | 23 | 23 | 3,16 |  |
| 12 | 12 | 16 | 16 | 16 |  |  |
| 13 | 13 | 22 | 22 | 22 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |
| 15 | 15 | 19 | 19 | 19 |  |  |
| 16 | 16 | 14 | 14 | 14 |  |  |
| 17 | 17 | 19 | 111 | 19 | 11,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110 |  |
| 18 | 18 | 34 | 34 | 34 |  |  |
| 19 | 19 | 11 | 11 | 11 |  |  |
| 20 | 20 | 37 | 37 | 37 |  |  |
| 21 | 21 | 20 | 20 | 20 |  |  |
| 22 | 22 | 12 | 12 | 12 |  |  |
| 23 | 23 | 21 | 21 | 21 |  |  |
| 24 | 24 | 26 | 26 | 27 |  |  |
| 25 | 25 | 28 | 28 | 28 |  |  |
| 26 | 26 | 23 | 23 | 23 |  |  |
| 27 | 27 | 8 | 9 | 9 | 5 |  |
| 28 | 28 | 27 | 27 | 27 |  |  |
| 29 | 29 | 36 | 36 | 36 |  |  |
| 30 | 30 | 27 | 27 | 27 |  |  |
| 31 | 31 | 20 | 21 | 21 | 3 |  |
| 32 | 32 | 33 | 33 | 33 |  |  |
| 33 | 33 | 24 | 25 | 25 | 7 |  |
| 34 | 34 | 33 | 33 | 33 |  |  |
| 35 | 35 | 27 | 27 | 27 |  | 19a,19b,19c,19d |
| 36 | 36 | 23 | 23 | 23 |  | 2a,2b,2c,4a,5a,5b,5c,5d |

EZR — data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml; chapters 10 vs canon 10. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 11 | 11 | 11 |  |  |
| 2 | 2 | 67 | 70 | 70 | 16,22,39 |  |
| 3 | 3 | 13 | 13 | 13 |  |  |
| 4 | 4 | 24 | 24 | 24 |  |  |
| 5 | 5 | 16 | 17 | 17 | 5 |  |
| 6 | 6 | 21 | 22 | 22 | 20 |  |
| 7 | 7 | 28 | 28 | 28 |  |  |
| 8 | 8 | 35 | 36 | 36 | 5 |  |
| 9 | 9 | 15 | 15 | 15 |  |  |
| 10 | 10 | 43 | 43 | 44 |  |  |

NEH — data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml; chapters 13 vs canon 13. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 11 | 1 | 11 | 11 | 11 |  |  |
| 12 | 2 | 20 | 20 | 20 |  |  |
| 13 | 3 | 31 | 32 | 32 | 7 |  |
| 14 | 4 | 22 | 23 | 23 | 11 |  |
| 15 | 5 | 19 | 19 | 19 |  |  |
| 16 | 6 | 19 | 19 | 19 |  |  |
| 17 | 7 | 70 | 79 | 73 | 26,27,68,69,74,75,76,77,78 |  |
| 18 | 8 | 17 | 18 | 18 | 3 |  |
| 19 | 9 | 38 | 38 | 38 |  |  |
| 20 | 10 | 38 | 39 | 39 | 11 |  |
| 21 | 11 | 27 | 36 | 36 | 16,20,21,28,29,32,33,34,35 |  |
| 22 | 12 | 33 | 47 | 47 | 4,5,6,9,15,16,17,18,19,20,21,38,40,41 |  |
| 23 | 13 | 31 | 31 | 31 |  |  |

JDT — data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml; chapters 16 vs canon 16. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 16 |  |  |
| 2 | 2 | 28 | 28 | 28 |  |  |
| 3 | 3 | 9 | 10 | 10 | 2 |  |
| 4 | 4 | 15 | 15 | 15 |  |  |
| 5 | 5 | 24 | 24 | 24 |  |  |
| 6 | 6 | 21 | 21 | 21 |  |  |
| 7 | 7 | 32 | 32 | 32 |  |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 14 | 19 | 14 | 14,15,16,17,18 |  |
| 10 | 10 | 23 | 23 | 23 |  |  |
| 11 | 11 | 23 | 23 | 23 |  |  |
| 12 | 12 | 20 | 20 | 20 |  |  |
| 13 | 13 | 20 | 20 | 20 |  |  |
| 14 | 14 | 19 | 19 | 19 |  |  |
| 15 | 15 | 14 | 14 | 13 |  |  |
| 16 | 16 | 25 | 25 | 25 |  |  |

TOB — data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 22 | 22 | 8 |  |
| 2 | 2 | 14 | 14 | 14 |  |  |
| 3 | 3 | 17 | 17 | 17 |  |  |
| 4 | 4 | 21 | 21 | 21 |  |  |
| 5 | 5 | 22 | 22 | 22 |  |  |
| 6 | 6 | 18 | 18 | 17 |  |  |
| 7 | 7 | 17 | 17 | 18 |  |  |
| 8 | 8 | 21 | 21 | 21 |  |  |
| 9 | 9 | 6 | 6 | 6 |  |  |
| 10 | 10 | 12 | 12 | 12 |  |  |
| 11 | 11 | 19 | 19 | 19 |  |  |
| 12 | 12 | 22 | 22 | 22 |  |  |
| 13 | 13 | 18 | 18 | 18 |  |  |
| 14 | 14 | 15 | 15 | 15 |  |  |

1MA — data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml; chapters 16 vs canon 16. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 63 | 64 | 64 | 26 |  |
| 2 | 2 | 70 | 70 | 70 |  |  |
| 3 | 3 | 60 | 60 | 60 |  |  |
| 4 | 4 | 60 | 61 | 61 | 8 |  |
| 5 | 5 | 68 | 68 | 68 |  |  |
| 6 | 6 | 63 | 63 | 63 |  |  |
| 7 | 7 | 50 | 50 | 50 |  |  |
| 8 | 8 | 32 | 32 | 32 |  |  |
| 9 | 9 | 72 | 73 | 73 | 27 |  |
| 10 | 10 | 89 | 89 | 89 |  |  |
| 11 | 11 | 74 | 74 | 74 |  |  |
| 12 | 12 | 53 | 53 | 53 |  |  |
| 13 | 13 | 53 | 53 | 53 |  |  |
| 14 | 14 | 49 | 49 | 49 |  |  |
| 15 | 15 | 41 | 41 | 41 |  |  |
| 16 | 16 | 24 | 24 | 24 |  |  |

2MA — data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml; chapters 15 vs canon 15. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 36 | 36 | 36 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 40 | 40 | 40 |  |  |
| 4 | 4 | 50 | 50 | 50 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 31 | 31 | 31 |  |  |
| 7 | 7 | 41 | 42 | 42 | 37 |  |
| 8 | 8 | 36 | 36 | 36 |  |  |
| 9 | 9 | 29 | 29 | 29 |  |  |
| 10 | 10 | 38 | 38 | 38 |  |  |
| 11 | 11 | 37 | 38 | 38 | 30 |  |
| 12 | 12 | 45 | 45 | 45 |  |  |
| 13 | 13 | 26 | 26 | 26 |  |  |
| 14 | 14 | 46 | 46 | 46 |  |  |
| 15 | 15 | 39 | 39 | 39 |  |  |

PRO — data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml; chapters 29 vs canon 31. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 32 | 33 | 33 | 16 |  |
| 2 | 2 | 22 | 22 | 22 |  |  |
| 3 | 3 | 35 | 35 | 35 |  | 16a,22a |
| 4 | 4 | 26 | 27 | 27 | 7 | 27a,27b |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 35 | 35 | 35 |  | 8a,8b,8c,11a |
| 7 | 7 | 26 | 27 | 27 | 18 | 1a |
| 8 | 8 | 35 | 36 | 36 | 33 | 21a |
| 9 | 9 | 18 | 18 | 18 |  | 12a,12b,12c,18a,18b,18c |
| 10 | 10 | 32 | 32 | 32 |  | 4a |
| 11 | 11 | 30 | 31 | 31 | 4 |  |
| 12 | 12 | 28 | 28 | 28 |  | 11a,13a |
| 13 | 13 | 24 | 25 | 25 | 6 | 9a,13a |
| 14 | 14 | 35 | 35 | 35 |  |  |
| 15 | 15 | 29 | 29 | 33 |  | 18a |
| 16 | 16 | 33 | 33 | 33 |  |  |
| 17 | 17 | 28 | 28 | 28 |  | 6a |
| 18 | 18 | 23 | 23 | 24 |  | 22a |
| 19 | 19 | 26 | 26 | 29 |  |  |
| 20 | 20 | 24 | 24 | 30 |  |  |
| 21 | 21 | 30 | 31 | 31 | 5 |  |
| 22 | 22 | 26 | 28 | 29 | 6,27 | 8a,9a,14a |
| 23 | 23 | 34 | 35 | 35 | 23 |  |
| 24 | 24 | 76 | 77 | 34 | 23 | 22a,22b,22c,22d,22e |
| 25 | 25 | 28 | 28 | 28 |  | 10a,29a |
| 26 | 26 | 28 | 28 | 28 |  | 11a |
| 27 | 27 | 27 | 27 | 27 |  | 20a,21a |
| 28 | 28 | 28 | 28 | 28 |  | 17a |
| 29 | 29 | 49 | 49 | 27 |  |  |

SNG — data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml; chapters 8 vs canon 8. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 17 | 17 | 17 |  |  |
| 3 | 3 | 11 | 11 | 11 |  |  |
| 4 | 4 | 15 | 16 | 16 | 8 |  |
| 5 | 5 | 17 | 17 | 16 |  |  |
| 6 | 6 | 12 | 12 | 13 |  |  |
| 7 | 7 | 13 | 13 | 13 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |

JOB — data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml; chapters 42 vs canon 42. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 13 | 13 | 13 |  | 9a,9b,9c,9d |
| 3 | 3 | 26 | 26 | 26 |  |  |
| 4 | 4 | 21 | 21 | 21 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 30 | 30 | 30 |  |  |
| 7 | 7 | 20 | 21 | 21 | 15 |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 35 | 35 | 35 |  |  |
| 10 | 10 | 21 | 21 | 22 |  |  |
| 11 | 11 | 20 | 20 | 20 |  |  |
| 12 | 12 | 25 | 25 | 25 |  |  |
| 13 | 13 | 28 | 28 | 28 |  |  |
| 14 | 14 | 21 | 22 | 22 | 7 |  |
| 15 | 15 | 35 | 35 | 35 |  |  |
| 16 | 16 | 23 | 23 | 22 |  |  |
| 17 | 17 | 16 | 16 | 16 |  |  |
| 18 | 18 | 21 | 21 | 21 |  |  |
| 19 | 19 | 29 | 29 | 29 |  | 4a |
| 20 | 20 | 29 | 29 | 29 |  |  |
| 21 | 21 | 34 | 34 | 34 |  |  |
| 22 | 22 | 30 | 30 | 30 |  |  |
| 23 | 23 | 17 | 17 | 17 |  |  |
| 24 | 24 | 25 | 25 | 25 |  |  |
| 25 | 25 | 6 | 6 | 6 |  |  |
| 26 | 26 | 14 | 14 | 14 |  |  |
| 27 | 27 | 23 | 23 | 23 |  |  |
| 28 | 28 | 28 | 28 | 28 |  |  |
| 29 | 29 | 25 | 25 | 25 |  |  |
| 30 | 30 | 31 | 31 | 31 |  |  |
| 31 | 31 | 40 | 40 | 40 |  |  |
| 32 | 32 | 22 | 22 | 22 |  |  |
| 33 | 33 | 32 | 33 | 33 | 32 |  |
| 34 | 34 | 37 | 37 | 37 |  |  |
| 35 | 35 | 15 | 16 | 16 | 3 |  |
| 36 | 36 | 33 | 33 | 33 |  | 28a,28b |
| 37 | 37 | 24 | 24 | 24 |  |  |
| 38 | 38 | 41 | 41 | 41 |  |  |
| 39 | 39 | 35 | 35 | 30 |  |  |
| 40 | 40 | 27 | 27 | 24 |  |  |
| 41 | 41 | 25 | 25 | 34 |  |  |
| 42 | 42 | 17 | 17 | 17 |  | 17a,17b,17c,17d,17e |

WIS — data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml; chapters 19 vs canon 19. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 16 |  |  |
| 2 | 2 | 24 | 24 | 24 |  |  |
| 3 | 3 | 6 | 19 | 19 | 5,6,7,8,9,10,11,12,13,14,15,16,17 |  |
| 4 | 4 | 21 | 21 | 20 |  |  |
| 5 | 5 | 23 | 23 | 23 |  |  |
| 6 | 6 | 25 | 25 | 25 |  |  |
| 7 | 7 | 30 | 30 | 30 |  |  |
| 8 | 8 | 21 | 21 | 21 |  |  |
| 9 | 9 | 19 | 19 | 18 |  |  |
| 10 | 10 | 21 | 21 | 21 |  |  |
| 11 | 11 | 26 | 26 | 26 |  |  |
| 12 | 12 | 27 | 27 | 27 |  |  |
| 13 | 13 | 19 | 19 | 19 |  |  |
| 14 | 14 | 31 | 31 | 31 |  |  |
| 16 | 16 | 19 | 19 | 29 |  |  |
| 17 | 17 | 29 | 29 | 21 |  |  |
| 18 | 18 | 21 | 21 | 25 |  |  |
| 19 | 19 | 25 | 25 | 22 |  |  |
| 20 | 20 | 22 | 22 | absent |  |  |

SIR — data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml; chapters 51 vs canon 51. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 26 | 30 | 30 | 5,8,13,21 |  |
| 2 | 2 | 18 | 18 | 18 |  |  |
| 3 | 3 | 29 | 31 | 31 | 19,24 |  |
| 4 | 4 | 31 | 31 | 31 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 37 | 37 | 37 |  |  |
| 7 | 7 | 34 | 36 | 36 | 16,17 | 16a,17a,16b,17b |
| 8 | 8 | 19 | 19 | 19 |  |  |
| 9 | 9 | 18 | 18 | 18 |  |  |
| 10 | 10 | 30 | 31 | 31 | 21 |  |
| 11 | 11 | 32 | 34 | 33 | 15,16 |  |
| 12 | 12 | 18 | 18 | 18 |  |  |
| 13 | 13 | 25 | 26 | 26 | 14 |  |
| 14 | 14 | 27 | 27 | 27 |  |  |
| 15 | 15 | 20 | 20 | 20 |  |  |
| 16 | 16 | 28 | 30 | 29 | 15,16 |  |
| 17 | 17 | 28 | 32 | 32 | 5,16,18,21 |  |
| 18 | 18 | 32 | 33 | 33 | 3 |  |
| 19 | 19 | 27 | 30 | 29 | 18,19,21 |  |
| 20 | 20 | 30 | 31 | 32 | 3 |  |
| 21 | 21 | 28 | 28 | 28 |  |  |
| 22 | 22 | 25 | 27 | 26 | 9,10 |  |
| 23 | 23 | 27 | 27 | 27 |  |  |
| 24 | 24 | 32 | 34 | 34 | 18,24 |  |
| 25 | 25 | 25 | 26 | 26 | 12 |  |
| 26 | 26 | 20 | 29 | 21 | 19,20,21,22,23,24,25,26,27 |  |
| 27 | 27 | 30 | 30 | 30 |  |  |
| 28 | 28 | 26 | 26 | 26 |  |  |
| 29 | 29 | 27 | 28 | 28 | 17 |  |
| 30 | 30 | 23 | 24 | 25 | 18 | 13b |
| 31 | 31 | 31 | 31 | 31 |  |  |
| 32 | 32 | 24 | 24 | 24 |  |  |
| 33 | 33 | 31 | 40 | 33 | 16,17,18,19,20,21,22,23,24 | 16a |
| 34 | 34 | 31 | 31 | 26 |  |  |
| 35 | 35 | 26 | 26 | 20 |  |  |
| 36 | 36 | 27 | 31 | 26 | 13,14,15,16 | 13a,16b |
| 37 | 37 | 31 | 31 | 31 |  |  |
| 38 | 38 | 34 | 34 | 34 |  |  |
| 39 | 39 | 35 | 35 | 35 |  |  |
| 40 | 40 | 30 | 31 | 30 | 30 |  |
| 41 | 41 | 22 | 22 | 24 |  |  |
| 42 | 42 | 25 | 25 | 25 |  |  |
| 43 | 43 | 33 | 33 | 33 |  |  |
| 44 | 44 | 23 | 23 | 23 |  |  |
| 45 | 45 | 26 | 26 | 26 |  |  |
| 46 | 46 | 20 | 20 | 20 |  |  |
| 47 | 47 | 25 | 25 | 25 |  |  |
| 48 | 48 | 25 | 25 | 25 |  |  |
| 49 | 49 | 16 | 16 | 16 |  |  |
| 50 | 50 | 29 | 29 | 29 |  |  |
| 51 | 51 | 30 | 30 | 30 |  |  |

HOS — data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 11 | 11 | 11 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |
| 3 | 3 | 5 | 5 | 5 |  |  |
| 4 | 4 | 19 | 19 | 19 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 11 | 11 | 11 |  |  |
| 7 | 7 | 16 | 16 | 16 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |
| 9 | 9 | 17 | 17 | 17 |  |  |
| 10 | 10 | 15 | 15 | 15 |  |  |
| 11 | 11 | 12 | 12 | 12 |  |  |
| 12 | 12 | 14 | 14 | 14 |  |  |
| 13 | 13 | 15 | 15 | 16 |  |  |
| 14 | 14 | 10 | 10 | 9 |  |  |

AMO — data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml; chapters 9 vs canon 9. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 15 |  |  |
| 2 | 2 | 16 | 16 | 16 |  |  |
| 3 | 3 | 15 | 15 | 15 |  |  |
| 4 | 4 | 13 | 13 | 13 |  |  |
| 5 | 5 | 27 | 27 | 27 |  |  |
| 6 | 6 | 14 | 14 | 14 |  |  |
| 7 | 7 | 17 | 17 | 17 |  |  |
| 8 | 8 | 14 | 14 | 14 |  |  |
| 9 | 9 | 15 | 15 | 15 |  |  |

MIC — data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml; chapters 7 vs canon 7. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 16 |  |  |
| 2 | 2 | 13 | 13 | 13 |  |  |
| 3 | 3 | 12 | 12 | 12 |  |  |
| 4 | 4 | 13 | 13 | 13 |  |  |
| 5 | 5 | 15 | 15 | 15 |  |  |
| 6 | 6 | 16 | 16 | 16 |  |  |
| 7 | 7 | 20 | 20 | 20 |  |  |

JOL — data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 20 | 20 | 20 |  |  |
| 2 | 2 | 32 | 32 | 32 |  |  |
| 3 | 3 | 21 | 21 | 21 |  |  |

OBA — data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml; chapters 1 vs canon 1. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |

JON — data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 16 | 16 | 17 |  |  |
| 2 | 2 | 11 | 11 | 10 |  |  |
| 3 | 3 | 10 | 10 | 10 |  |  |
| 4 | 4 | 11 | 11 | 11 |  |  |

NAM — data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 15 | 15 | 15 |  |  |
| 2 | 2 | 14 | 14 | 13 |  |  |
| 3 | 3 | 19 | 19 | 19 |  |  |

HAB — data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 17 | 17 | 17 |  |  |
| 2 | 2 | 20 | 20 | 20 |  |  |
| 3 | 3 | 19 | 19 | 19 |  |  |

ZEP — data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml; chapters 3 vs canon 3. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 18 | 18 | 18 |  |  |
| 2 | 2 | 14 | 14 | 15 |  |  |
| 3 | 3 | 19 | 20 | 20 | 13 |  |

HAG — data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml; chapters 2 vs canon 2. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 14 | 14 | 15 |  |  |
| 2 | 2 | 23 | 23 | 23 |  |  |

ZEC — data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml; chapters 14 vs canon 14. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 21 | 21 | 21 |  |  |
| 2 | 2 | 13 | 13 | 13 |  |  |
| 3 | 3 | 10 | 10 | 10 |  |  |
| 4 | 4 | 14 | 14 | 14 |  |  |
| 5 | 5 | 11 | 11 | 11 |  |  |
| 6 | 6 | 15 | 15 | 15 |  |  |
| 7 | 7 | 14 | 14 | 14 |  |  |
| 8 | 8 | 23 | 23 | 23 |  |  |
| 9 | 9 | 17 | 17 | 17 |  |  |
| 10 | 10 | 12 | 12 | 12 |  |  |
| 11 | 11 | 17 | 18 | 17 | 17 |  |
| 12 | 12 | 13 | 14 | 14 | 12 |  |
| 13 | 13 | 9 | 9 | 9 |  |  |
| 14 | 14 | 21 | 21 | 21 |  |  |

MAL — data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml; chapters 4 vs canon 4. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 14 | 14 | 14 |  |  |
| 2 | 2 | 17 | 17 | 17 |  |  |
| 3 | 3 | 18 | 18 | 18 |  |  |
| 4 | 4 | 6 | 6 | 6 |  |  |

ISA — data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml; chapters 66 vs canon 66. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 31 | 31 | 31 |  |  |
| 2 | 2 | 21 | 21 | 22 |  |  |
| 3 | 3 | 26 | 26 | 26 |  |  |
| 4 | 4 | 6 | 6 | 6 |  |  |
| 5 | 5 | 30 | 30 | 30 |  |  |
| 6 | 6 | 13 | 13 | 13 |  |  |
| 7 | 7 | 25 | 25 | 25 |  |  |
| 8 | 8 | 22 | 22 | 22 |  |  |
| 9 | 9 | 20 | 21 | 21 | 10 |  |
| 10 | 10 | 34 | 34 | 34 |  |  |
| 11 | 11 | 16 | 16 | 16 |  |  |
| 12 | 12 | 6 | 6 | 6 |  |  |
| 13 | 13 | 21 | 22 | 22 | 20 |  |
| 14 | 14 | 32 | 32 | 32 |  |  |
| 15 | 15 | 9 | 9 | 9 |  |  |
| 16 | 16 | 14 | 14 | 14 |  |  |
| 17 | 17 | 14 | 14 | 14 |  |  |
| 18 | 18 | 7 | 7 | 7 |  |  |
| 19 | 19 | 25 | 25 | 25 |  |  |
| 20 | 20 | 6 | 6 | 6 |  |  |
| 21 | 21 | 17 | 17 | 17 |  |  |
| 22 | 22 | 23 | 23 | 25 |  |  |
| 23 | 23 | 18 | 18 | 18 |  |  |
| 24 | 24 | 23 | 23 | 23 |  |  |
| 25 | 25 | 12 | 12 | 12 |  |  |
| 26 | 26 | 21 | 21 | 21 |  |  |
| 27 | 27 | 13 | 13 | 13 |  |  |
| 28 | 28 | 29 | 29 | 29 |  |  |
| 29 | 29 | 24 | 24 | 24 |  |  |
| 30 | 30 | 33 | 33 | 33 |  |  |
| 31 | 31 | 9 | 9 | 9 |  |  |
| 32 | 32 | 20 | 20 | 20 |  | head |
| 33 | 33 | 24 | 24 | 24 |  |  |
| 34 | 34 | 17 | 17 | 17 |  |  |
| 35 | 35 | 9 | 10 | 10 | 4 |  |
| 36 | 36 | 22 | 22 | 22 |  |  |
| 37 | 37 | 36 | 38 | 38 | 11,15 |  |
| 38 | 38 | 21 | 22 | 22 | 17 |  |
| 39 | 39 | 8 | 8 | 8 |  |  |
| 40 | 40 | 31 | 31 | 31 |  |  |
| 41 | 41 | 29 | 29 | 29 |  |  |
| 42 | 42 | 25 | 25 | 25 |  |  |
| 43 | 43 | 27 | 28 | 28 | 19 |  |
| 44 | 44 | 28 | 28 | 28 |  |  |
| 45 | 45 | 25 | 25 | 25 |  |  |
| 46 | 46 | 13 | 13 | 13 |  |  |
| 47 | 47 | 14 | 15 | 15 | 8 |  |
| 48 | 48 | 22 | 22 | 22 |  |  |
| 49 | 49 | 25 | 26 | 26 | 13 |  |
| 50 | 50 | 11 | 11 | 11 |  |  |
| 51 | 51 | 23 | 23 | 23 |  |  |
| 52 | 52 | 14 | 15 | 15 | 3 |  |
| 53 | 53 | 12 | 12 | 12 |  |  |
| 54 | 54 | 17 | 17 | 17 |  |  |
| 55 | 55 | 13 | 13 | 13 |  |  |
| 56 | 56 | 11 | 11 | 12 |  |  |
| 57 | 57 | 21 | 21 | 21 |  |  |
| 58 | 58 | 14 | 14 | 14 |  |  |
| 59 | 59 | 21 | 21 | 21 |  |  |
| 60 | 60 | 22 | 22 | 22 |  |  |
| 61 | 61 | 11 | 11 | 11 |  |  |
| 62 | 62 | 12 | 12 | 12 |  |  |
| 63 | 63 | 19 | 19 | 19 |  |  |
| 64 | 64 | 12 | 12 | 12 |  |  |
| 65 | 65 | 23 | 25 | 25 | 21,22 |  |
| 66 | 66 | 24 | 24 | 24 |  |  |

BAR — data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml; chapters 5 vs canon 6. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 35 | 35 | 35 |  |  |
| 3 | 3 | 38 | 38 | 37 |  |  |
| 4 | 4 | 37 | 37 | 37 |  |  |
| 5 | 5 | 9 | 9 | 9 |  |  |

LAM — data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml; chapters 5 vs canon 5. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 22 | 22 | 22 |  |  |
| 2 | 2 | 22 | 22 | 22 |  |  |
| 3 | 3 | 62 | 66 | 66 | 22,23,24,29 |  |
| 4 | 4 | 22 | 22 | 22 |  |  |
| 5 | 5 | 22 | 22 | 22 |  |  |

EZK — data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml; chapters 48 vs canon 48. Nonpositive/nonnumeric chapters: []

| Source chapter | Canon comparison chapter | Observed verse records | Max verse label | Canon verses | Holes | Zero/nonnumeric labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 27 | 28 | 28 | 14 |  |
| 2 | 2 | 10 | 10 | 10 |  |  |
| 3 | 3 | 27 | 27 | 27 |  |  |
| 4 | 4 | 17 | 17 | 17 |  |  |
| 5 | 5 | 17 | 17 | 17 |  |  |
| 6 | 6 | 14 | 14 | 14 |  |  |
| 7 | 7 | 25 | 27 | 27 | 10,11 | 11s |
| 8 | 8 | 17 | 18 | 18 | 2 |  |
| 9 | 9 | 11 | 11 | 11 |  |  |
| 10 | 10 | 21 | 22 | 22 | 14 |  |
| 11 | 11 | 23 | 25 | 25 | 11,12 |  |
| 12 | 12 | 28 | 28 | 28 |  |  |
| 13 | 13 | 23 | 23 | 23 |  |  |
| 14 | 14 | 23 | 23 | 23 |  |  |
| 15 | 15 | 8 | 8 | 8 |  |  |
| 16 | 16 | 63 | 63 | 63 |  |  |
| 17 | 17 | 24 | 24 | 24 |  |  |
| 18 | 18 | 32 | 32 | 32 |  |  |
| 19 | 19 | 14 | 14 | 14 |  |  |
| 20 | 20 | 49 | 49 | 49 |  |  |
| 21 | 21 | 32 | 32 | 32 |  |  |
| 22 | 22 | 31 | 31 | 31 |  |  |
| 23 | 23 | 48 | 49 | 49 | 3 |  |
| 24 | 24 | 27 | 27 | 27 |  |  |
| 25 | 25 | 17 | 17 | 17 |  |  |
| 26 | 26 | 21 | 21 | 21 |  |  |
| 27 | 27 | 35 | 36 | 36 | 31 |  |
| 28 | 28 | 26 | 26 | 26 |  |  |
| 29 | 29 | 21 | 21 | 21 |  |  |
| 30 | 30 | 26 | 26 | 26 |  |  |
| 31 | 31 | 18 | 18 | 18 |  |  |
| 32 | 32 | 31 | 32 | 32 | 19 |  |
| 33 | 33 | 32 | 33 | 33 | 26 |  |
| 34 | 34 | 31 | 31 | 31 |  |  |
| 35 | 35 | 15 | 15 | 15 |  |  |
| 36 | 36 | 38 | 38 | 38 |  |  |
| 37 | 37 | 28 | 28 | 28 |  |  |
| 38 | 38 | 23 | 23 | 23 |  |  |
| 39 | 39 | 29 | 29 | 29 |  |  |
| 40 | 40 | 48 | 49 | 49 | 30 |  |
| 41 | 41 | 26 | 26 | 26 |  |  |
| 42 | 42 | 20 | 20 | 20 |  |  |
| 43 | 43 | 27 | 27 | 27 |  |  |
| 44 | 44 | 31 | 31 | 31 |  |  |
| 45 | 45 | 25 | 25 | 25 |  |  |
| 46 | 46 | 24 | 24 | 24 |  |  |
| 47 | 47 | 23 | 23 | 23 |  |  |
| 48 | 48 | 35 | 35 | 35 |  |  |

## B Psalms numbering evidence


Observed labels include Psalm 151. Canon has 150 Psalms. A single offset cannot describe the boundaries. Standard candidate relationship to test: LXX 1-8 = canon 1-8; LXX 9 combines canon 9+10; LXX 10-112 corresponds to canon 11-113; LXX 113 combines canon 114+115; LXX 114+115 split canon 116; LXX 116-145 corresponds to canon 117-146; LXX 146+147 split canon 147; LXX 148-150 = canon 148-150. This is a candidate semantic mapping, NOT proven by counts alone: canon.js contains no wording or alignment annotations. The exact directly observed relationship is the chapter labels and counts below; verse offsets also reflect numbered titles. Semantic verse alignment remains a blocker.
| LXX chapters | Canon chapters | Observed LXX total | Canon total |
| --- | --- | --- | --- |
| 9 | 9+10 | 39 | 38 |
| 113 | 114+115 | 26 | 26 |
| 114+115 | 116 | 18 | 19 |
| 146+147 | 147 | 20 | 20 |
| Source chapter | Observed verses | Observed incipit |
| --- | --- | --- |
| 8 | 10 | Εἰς τὸ τέλος, ὑπερ τῶν ληνῶν· ψαλμὸς τῷ Δαυείδ. |
| 9 | 39 | Εἰς τὸ τέλος, ὑπὲρ τῶν κρυφίων τοῦ υἱοῦ· ψαλμὸς τῷ Δαυείδ. |
| 10 | 7 | Εἰς τὸ τέλος· τῷ Δαυεὶδ ψαλμός. Ἐπὶ τῷ κυρίῳ πέποιθα· πῶς ἐρεῖτε τῇ ψυχῇ μου Μεταναστεύου ἐπὶ τὰ ὄρη ὡς στρουθίον ; |
| 112 | 9 | Αἰνεῖτε, παῖδες, Κύριον, αἰνεῖτε τὸ ὄνομα αὐτοῦ. |
| 113 | 26 | Ἐν ἐξόδῳ Ἰσραὴλ ἐξ Αἰγύπτου, οἴκου Ἰακὼβ ἐκ λαοῦ βαρβάρου, |
| 114 | 9 | Ἠγάπησα ὅτι εἰσακούσεται ὁ θεὸς τῆς φωνῆς τῆς δεήσεὼς μου, |
| 115 | 9 | Ἐπίστευσα, διὸ ἐλάλησα· ἐγὼ δὲ ἐταπεινώθην σφόδρα. |
| 116 | 2 | Αἰνεῖτε τὸν κύριον, πάντα τὰ ἔθνη, αἰνεσάτωσαν αὐτὸυ πάντες οἱ λαοί |
| 145 | 10 | Aἴνει, ἡ ψυχὴ μου, τὸν κύριον· |
| 146 | 11 | Αἰνεῖτε τὸν κύριον, ὅτι ἀγαθὸν ψαλμός· τῷ θεῷ ἡμῶν ἡδυνθείη αἴνεσις. |
| 147 | 9 | Ἐπαίνει, Ἰερουσαλήμ, τὸν κύριον, αὔει τὸν θεόν σου, Σειών· |
| 148 | 14 | Αἰνεῖτε τὸν κύριον ἐκ τῶν οὐρανῶν, αἰνεῖτε αὐτὸν ἐν τοῖς ὑψίστοις. |
| 150 | 6 | Αἰνεῖτε τὸν θεὸν ἐν τοῖς ἁγίοις αὐτοῦ, αἰνεῖτε αὐτὸν ἐν στερεώματι δυνάμεως αὐτοῦ· |
| 151 | 7 | Μικρὸς ἤμην ἐν τοῖς ἀδελφοῖς μου. καὶ νεώτερος ἐν τῷ οἴκῳ τοῦ πατρός μου· ἐποίμαινον τὰ πρόβατα τοῦ πατρός μου. |

## Source comparison: five books, verse level


A README identifies B as its ancestor and says its data was rebased to First1KGreek commit eb81494731fd632f582c4b94634127bdbd596b43. Current B snapshot is pinned independently. A converter explicitly filters ¶ [ ] §, rejoins trailing hyphen fragments, replaces Greek ano teleia with middle dot, excludes notes and heads and normalizes Unicode. These are upstream transformations, not edits performed by this audit. Diagnostic projection only removes those four markers, rejoins hyphen-whitespace and normalizes NFC/whitespace/ano teleia; it does not reproduce koinenlp or the stateful SAX converter. It never replaces source text.
| Book | Union refs | A only | B only | Equal NFC/whitespace | Equal diagnostic projection | Different before projection |
| --- | --- | --- | --- | --- | --- | --- |
| GEN | 1523 | 0 | 0 | 1361 | 1521 | 162 |
| PSA | 2551 | 37 | 0 | 2441 | 2470 | 73 |
| ISA | 1291 | 14 | 12 | 77 | 77 | 1188 |
| SIR | 1370 | 1 | 0 | 1347 | 1369 | 22 |
| DAN | 412 | 0 | 0 | 394 | 411 | 18 |

### GEN first 10 differing verses

| Ref | A observed | B observed | Diagnostic projection equal? |
| --- | --- | --- | --- |
| 1:13 | καὶ ἐγένετο ἐσπέρα καὶ ἐγένετο πρωί, ἡμέρα τρίτη. | καὶ ἐγένετο §ἐσπέρα καὶ ἐγένετο πρωί, ἡμέρα τρίτη. | true |
| 1:14 | καὶ εἶπεν ὁ θεός Γενηθήτωσαν φωστῆρες ἐν τῷ στερεώματι τοῦ οὐρανοῦ εἰς φαῦσιν τῆς γῆς, καὶ ἄρχεῖν τῆς ἡμέρας καὶ τῆς νυκτὸς καὶ διαχωρίζειν ἀνὰ μέσον τῆς ἡμέρας καὶ ἀνὰ μέσον τῆς νυκτός· καὶ ἔστωσαν ε | καὶ § εἶπεν ὁ θεός Γενηθήτωσαν φωστῆρες ἐν τῷ στερεώματι τοῦ οὐρανοῦ εἰς φαῦσιν τῆς γῆς, καὶ ἄρχεῖν τῆς ἡμέρας καὶ τῆς νυκτὸς καὶ διαχωρίζειν ἀνὰ μέσον τῆς ἡμέρας καὶ ἀνὰ μέσον τῆς νυκτός· καὶ ἔστωσαν | true |
| 1:19 | καὶ ἐγένετο ἑσπέρα καὶ ἐγένετο πρωί, ἡμέρα τετάρτη. | καὶ ἐγένετο ἑσπέρα καὶ ἐγένετο πρωί, ἡμέρα τετάρτη. ¶ | true |
| 1:20 | Καὶ εἶπεν ὁ θεός Ἑξαγαγέτω τὰ ὕδατα ἑρπετὰ ψυχῶν ζωσῶν καὶ πετεινὰ πετόμενα ἐπὶ τῆς γῆς κατὰ τὸ στερέωμα του οὐρανοῦ • καὶ ἐγένετο οὕτως. | Καὶ εἶπεν ὁ θεός Ἑξαγαγέτω τὰ ὕδατα ἑρπετὰ ψυχῶν ζωσῶν καὶ πετεινὰ πετόμεν[α] ἐπὶ τῆς γῆς κατὰ τὸ στερέωμ[α του] οὐρανοῦ • καὶ ἐγένετο οὕτως. | true |
| 1:21 | καὶ ἐποίησεν ὁ θεὸς τὰ κήτη τὰ μεγάλα καὶ πᾶσαν ψυχὴν ζῴων ἑρπετῶν, ἃ ἐξήγαγεν τὰ ὕδατα κατὰ γένη αὐτῶν, καὶ πᾶν πετεινὸν πτερωτὸν κατὰ γένος· καὶ ἴδεν ὁ θεὸς ὅτι καλά. | καὶ ἐποίησεν ὁ θεὸς τὰ κήτη [τὰ με]γάλα καὶ πᾶσαν ψυχὴν [ζῴων ἑρπε]τῶν, ἃ ἐξήγαγεν [τὰ ὕδατα κατὰ γένη αὐτῶν], καὶ πᾶν πετεινὸν πτ[ερωτὸν] κατὰ γένος· καὶ ἴδεν ὁ [θεὸς ὅτι καλά]. | true |
| 1:22 | καὶ ηὐλόγησεν αὐτὰ ὁ θεὸς λέγων Αὐξάνεσθε καὶ πληθύνεσθε, καὶ πληρώσατε τὰ ὕδατα ἐν ταῖς θαλάσσαις, καὶ τὰ πετεινὰ πληθυνέσθωσαν ἐπὶ τῆς γῆς. | καὶ ηὐλόγησεν αὐτὰ ὁ θ[εὸς λέγων] Αὐξάνεσθε καὶ πληθ[ύνεσθε, καὶ] πληρώσατε τὰ ὕδατα [ἐν ταῖς θα]λάσσαις, καὶ τὰ πετε[ινὰ πληθυ]νέσθωσαν ἐπὶ τῆς γῆς. | true |
| 1:23 | καὶ ἐγένετο ἑσπέρα καὶ εγένετο πρωί, ἡμέρα πέμπτη. | καὶ ἐγέ]νετο ἑσπέρα καὶ εγ[ένετο πρωί], ἡμέρα πέμπτη. | true |
| 1:24 | Καὶ εἶπεν ὁ θεός Ἐξαγαγέτω ἡ γῆ ψυχὴν ζῶσαν κατὰ γένος, τετράποδα καὶ ἑρπετὰ καὶ θηρία τῆς γῆς κατὰ γένος, καὶ ἐγένετο οὕτως. | Καὶ εἶπεν ὁ θεός Ἐξαγαγ[έτω ἡ γῆ ψυχὴν] ζῶσαν κατὰ γένος, [τετράποδα] καὶ ἑρπετὰ καὶ θηρί[α τῆς γῆς κατὰ] γένος, καὶ ἐγένετο [οὕτως]. | true |
| 1:25 | καὶ ἐποίησεν ὁ θεὸς τὰ θηρία τῆς γῆς κατὰ γένος καὶ τὰ κτήνη κατὰ γένος καὶ πάντα τὰ ἑρπετὰ τῆς γῆς κατὰ γένος αὐτῶν· καὶ ἴδεν ὁ θεὸς ὅτι καλά. | καὶ ἐποίησεν ὁ θεὸς τὰ [θηρία τῆς γῆς] κατὰ γένος καὶ τὰ κτ[ήνη κατὰ γέ]νος καὶ πάντα τὰ ἑρπ[ετὰ τῆς γῆς] κατὰ γένος αὐτῶν· καὶ ἴδεν ὁ θεὸς ὅτι καλά. | true |
| 1:26 | καὶ εἶπεν ὁ θεός Ποιήσωμεν ἄνθρωπον κατ’ εἰκόνα ἡμετέραν καὶ κἀθ᾽ ὁμοίωσιν· καὶ ἀρχέτωσαν τῶν ἰχθύων τῆς θαλάσσης καὶ τῶν πετεινῶν τοῦ οὐρανοῦ καὶ τῶν κτηνῶν καὶ πάτης τῆς γῆς καὶ πάντων τῶν ἑρπετῶν τ | §καὶ εἶπεν ὁ θεός Ποιήσωμεν ἄνθρωπον κατ’ εἰκόνα ἡμετέραν καὶ κἀθ᾽ ὁμοίωσιν· καὶ ἀρχέτωσαν τῶν ἰχθύων τῆς θαλάσσης καὶ τῶν πετεινῶν τοῦ οὐρανοῦ καὶ τῶν κτηνῶν καὶ πάτης τῆς γῆς καὶ πάντων τῶν ἑρπετῶν  | true |

### PSA first 10 differing verses

| Ref | A observed | B observed | Diagnostic projection equal? |
| --- | --- | --- | --- |
| 9:6 | ἐπετίμησας ἔθνεσιν, καὶ ἀπώλετο ὁ ἀσεβής· τὸ ὄνομα αὐτῶν ἐξήλειψας εἰς τὸν αἰῶνα καὶ εἰς τὸν αἰῶνα > τοῦ αἰῶνος. | ἐπετίμησας ἔθνεσιν, καὶ ἀπώλετο ὁ ἀσεβής· τὸ ὄνομα αὐτῶν ἐξήλειψας εἰς τὸν αἰῶνα καὶ εἰς τὸν αἰῶνα >τοῦ αἰῶνος. | false |
| 10:2 | ὅτι ἰδοὺ οἱ ἁμαρτωλοὶ ἐνέτειναν τόξον, ἡτοίμασαν βέλη εἰς φαρέτραν, τοῦ κατατοξεῦσαι ἐν σκοτομήνῃ τοὺς εὐθεῖς τῇ καρδίᾳ. | ὅτι ἰδοὺ οἱ ἁμαρτωλοὶ ἐνέτειναν τόξον, ἡτοίμασαν βέλη §εἰς φαρέτραν, τοῦ κατατοξεῦσαι ἐν σκοτομήνῃ τοὺς εὐθεῖς τῇ καρδίᾳ. | true |
| 15:5 | Στηλογραφία τῷ Δαυείδ. Κύριος ἡ μερὶς τῆς κληρονομίας μου καὶ τοῦ ποτηρίου μου· σὺ εἶ ὁ ἀποκαθιστῶν τὴν κληρονομίαν μου ἐμοί. | Κύριος ἡ μερὶς τῆς κληρονομίας μου καὶ τοῦ ποτηρίου μου· σὺ εἶ ὁ ἀποκαθιστῶν τὴν κληρονομίαν μου ἐμοί. | false |
| 16:11 | Προσευχὴ τοῦ Δαυείδ. ἐκβάλλοντές με νυνὶ περιεκύκλωσάν με, τοὺς ὀφθαλμοὺς αὐτῶν ἔθεντο ἐκκλῖναι ἐν τῇ γῇ· | ἐκβάλλοντές με νυνὶ περιεκύκλωσάν με, τοὺς ὀφθαλμοὺς αὐτῶν ἔθεντο ἐκκλῖναι ἐν τῇ γῇ· | false |
| 18:6 | ἐν τῷ ἡλίῳ ἔθετο τὸ σκήνωμα αὐτοῦ. καὶ αὐτὸς ὡς νυμφίος ἐκπορευόμενος ἐκ παστοῦ αὐτοῦ, ἀγαλλιάσεται ὡς γίγας δραμεῖν ὁδὸν αὐτοῦ. | ἐν τῷ ἡλίῳ ἔθετο τὸ σκήνωμα αὐτοῦ. καὶ αὐτὸς ὡς νυμφίος ἐκπορευόμενος ἐκ παστοῦ αὐτοῦ, ἀγαλλιάσεται ὡς γίγας δραμεῖν ὁδὸν αὐτοῦ.¶ | true |
| 20:14 | ὑψώθητι, Κύριε, ἐν τῇ δυνάμει σου, ᾄσομεν καὶ ψαλοῦμεν τὰς δυναστείας σου. | ὑψώθητι, Κύριε, ἐν τῇ δυνάμει σου, ᾄσομεν καὶ ψαλοῦμεν § τὰς δυναστείας σου. | true |
| 23:6 | Ψαλμὸς τῷ Δαυείδ· τῆς μιᾶς σαββάτων. αὕτη ἡ γενεὰ ζητούντων αὐτόν, ζητούντων τὸ πρόσωπον τοῦ θεοῦ Ἰακώβ. διάψαλμα. | αὕτη ἡ γενεὰ ζητούντων αὐτόν, ζητούντων τὸ πρόσωπον τοῦ θεοῦ Ἰακώβ. διάψαλμα. | false |
| 24:10 | Ψαλμὸς τῷ Δαυείδ. πᾶσαι αἱ ὁδοὶ Κυρίου ἔλεος καὶ ἀλήθεια τοῖς ἐκζητοῦσιν τὴν διαθήκην αὐτοῦ καὶ τὰ μαρτύρια αὐτοῦ. | πᾶσαι αἱ ὁδοὶ Κυρίου ἔλεος καὶ ἀλήθεια τοῖς ἐκζητοῦσιν τὴν διαθήκην αὐτοῦ καὶ τὰ μαρτύρια αὐτοῦ. | false |
| 26:12 | Τοῦ Δαυείδ, πρὸ τοῦ χρισθῆναι. μὴ παραδῷς με εἰς ψυχὰς θλιβόντων με. ὅτι ἐπανέστησάν μοι μάρτυρες ἄδικοι, καὶ ἐψεύσατο ἡ ἀδικία ἑαυτῇ. | μὴ παραδῷς με εἰς ψυχὰς θλιβόντων με. ὅτι ἐπανέστησάν μοι μάρτυρες ἄδικοι, καὶ ἐψεύσατο ἡ ἀδικία ἑαυτῇ. | false |
| 26:1 | Κύριος φωτισμός μου καὶ σωτήρ μου, τίνα φοβηθήσομαι; Κύριος ὑπερασπιστὴς τῆς ζωῆς μου, ἀπὸ τίνος δειλιάσω; | §Κύριος φωτισμός μου καὶ σωτήρ μου, τίνα φοβηθήσομαι; Κύριος ὑπερασπιστὴς τῆς ζωῆς μου, ἀπὸ τίνος δειλιάσω; | true |

### ISA first 10 differing verses

| Ref | A observed | B observed | Diagnostic projection equal? |
| --- | --- | --- | --- |
| 1:1 | Ὅρασις ἥν εἶδεν Ἠσαίας υἱὸς Ἀμώς, ἥν εἶδεν κατὰ τῆς Ἰουδαίας καὶ κατὰ Ἰερουσαλήμ, ἐν βασιλείᾳ Ὀζίου καὶ Ἰωαθὰμ καὶ Ἀχὰς καὶ Ἐζεκίου οἳ ἐβασίλευσαν τῆς Ἰουδαίας. | OPAΣΙΣ ἣν εἶδευ Ἠσαίας υἱὸς Ἀμώς, ἣν εἶδεν κατὰ τῆς Ἰουδαίας καὶ κατὰ Ἰερουσαλήμ, ἐν βασιλείᾳ Ὀζείου· καὶ Ἰωαθὰμ καὶ Ἀχὰς καὶ Ἐζεκίου οἳ ἐβασίλευσαν τῆς Ἰουδαίας. | false |
| 1:3 | ἔγνω βοῦς τὸν κτησάμενον καὶ ὄνος τὴν φάτνην τοῦ κυρίου αὑτοῦ· Ἰσραὴλ δέ με οὐκ ἔγνω, καὶ ὃ λαός με οὗ συνῆκεν. | ἔγνω βοῦς τὸν κτησάμενον καὶ ὄνος τὴν φάτνην τοῦ κυρίου αὐτοῦ· Ἰσραὴλ δέ με οὐκ ἔγνω, καὶ ὁ λαός με οὐ συνῆκεν. | false |
| 1:4 | οὐαὶ ἔθνος ἁμαρτωλόν, λαὸς πλήρης ἁμαρτιῶν, σπέρμα πονηρόν, υἱοὶ ἄνομοι. ἐγκατελίπετε τὸν κύριον καὶ παρωργίσατε τὸν ἅγιον τοῦ Ἰσραήλ. | οὐαὶ ἔθνος ἁμαρτωλόν, λαὸς πλήρης ἁμαρτιῶν, σπέρμα πονηρόν, υἱοὶ ἄνομοι. ἐγκατελίπατε τὸν κύριον καὶ παρωργίσατε τὸν ἅγιον τοῦ Ἰσραήλ. | false |
| 1:5 | τί ἔτι πληγῆτε προστιθέντες ἀνομίαν ; πᾶσα κεφαλὴ εἷς πόνον καὶ πᾶσα καρδία εἷς λύπην. | τί ἔτι πληγῆτε προστιθέντες ἀνομίαν; πᾶσα κεφαλὴ εἰς πόνον καὶ πᾶσα καρδία εἰς λύπην. | false |
| 1:6 | ἀπὸ ποδῶν ἔως κεφαλῆς, οὔτε τραῦμα οὔτε μώλωψ οὔτε πληγὴ φλεγμαίνουσα, οὐκ ἔστιν μάλαγμα ἐπιθεῖναι οὔτε ἔλαιον οὔτε καταδέσμους. | ἀπὸ ποδῶν ἕως κεφαλῆς οὔτε τραῦμα οὔτε μώλωψ οὔτε πληγὴ φλεγμαίνουσα, οὐκ ἔστιν μάλαγμα ἐπιθεῖναι οὔτε ἔλαιον οὔτε καταδέσμους. | false |
| 1:7 | ἡ γῆ ὑμῶν ἕρημος, αἶ πόλεις ὑμῶν πυρίκαυστον τὴν χώραν ὑμῶν ἐνώπιον ὑμῶν ἀλλότριοι κατεσθίουσιν αὐτήν, καὶ ἠρήμωται κατεστραμμένη ὑπὸ λαῶν ἀλλοτρίων. | ἡ γῆ ὑμῶν ἔρημος, αἱ πόλεις ὑμῶν πυρίκαυστοι· τὴν χώραν ὑμῶν ἐνώπιον ὑμῶν ἀλλότριοι κατεσθίουσιν αὐτήν, καὶ ἠρήμωται κατεστραμμένη ὑπὸ λαῶν ἀλλοτρίων. | false |
| 1:8 | ἐγκαταλειφθήσεται ἦ θυγάτηρ Σιὼν ὡς σκηνὴ ἐν ἀμπελῶνι, καὶ ὡς ὀπωροφυλάκιον ἐν σικυηράτῳ, ὥς πόλις πολιορκουμένη· | ἐγκαταλειφθήσεται ἡ θυγάτηρ Σειὼν ὡς σκηνὴ ἐν ἀμπελῶνι, καὶ ὡς ὀπωροφυλάκιον ἐν σικυηράτῳ, ὡς πόλις πολιορκουμένη· | false |
| 1:9 | καὶ εἶ μὴ Κύριος σαβαὼθ ἐγκατέλιπεν ἡμῖν σπέρμα, ὡς Σόδομα ἂν ἐγενήθημεν, καὶ ὡς Γόμορρα ἂν ὡμοιώθημεν. | καὶ εἰ μὴ Κύριος σαβαὼθ ἡμῖν σπέρμα, ὡς Σόδομα ἂν ἐγενήθημεν, καὶ ὡς Γόμορρα ἂν ὡμοιώθημεν. | false |
| 1:11 | τί ἐμοὶ πλῆθος τῶν θυσιῶν ὑμῶν ; λέγει Κύριος· πλήρης εἰμὶ ὁλοκαυτωμάτων κριῶν, καὶ στέαρ ἀρνῶν καὶ αἷμα ταύρων καὶ τράγων οὐ βούλομαι, | τί μοι πλῆθος τῶν θυσιῶν ὑμῶν ; λέγει Κύριος· πλήρης εἰμὶ ὁλοκαυτωμάτων κριῶν, καὶ στέαρ ἀρνῶν καὶ αἷμα ταύρων καὶ τράγων οὐ βούλομαι, | false |
| 1:12 | οὐδ' ἂν ἔρχησθε ὀφθῆναί μοι. τίς γὰρ ἐξεζήτησεν ταῦτα ἐκ τῶν χειρῶν ὑμῶν; πατεῖν τὴν αὐλήν μου | οὐδ’ ἂν ἔρχησθε ὀφθῆναί μοι. τίς γὰρ ἐξεζήτησεν ταῦτα ἐκ τῶν χειρῶν ὑμῶν; πατεῖν τὴν αὐλὴν μου | false |

### SIR first 10 differing verses

| Ref | A observed | B observed | Diagnostic projection equal? |
| --- | --- | --- | --- |
| 7:14 | μὴ ἀδολέσχει ἐν πλήθει πρεσβυτέρων, καὶ μὴ δευτερώσῃς λόγον ἐν προσευχῇ σου. | μὴ ἀδολέσχει ἐν πλήθει πρεσβυτέρων,¶ καὶ μὴ δευτερώσῃς λόγον ἐν προσευχῇ σου. | true |
| 8:15 | μετὰ τολμηροῦ μὴ πορεύου ἐν ὁδῷ, ἵνα μὴ καταβαρύνηται κατὰ σοῦ· αὐτὸς γὰρ κατὰ τὸ θέλημα αὐτοῦ ποιήσει, καὶ τῇ ἀφροσύνῃ αὐτοῦ συναπολῇ. | μετὰ τολμηροῦ μὴ πορεύου ἐν ὁδῷ, ἵνα μὴ καταβαρύνηται κατὰ σοῦ· §αὐτὸς γὰρ κατὰ τὸ θέλημα αὐτοῦ ποιήσει, καὶ τῇ ἀφροσύνῃ αὐτοῦ συναπολῇ. | true |
| 11:17 | Δόσις Κυρίου παραμένει εὐσεβέσιν, καὶ ἡ εὐδοκία αὐτοῦ εἰς τὸν αἰῶνα εὐοδααοθήσεται. | Δόσις Κυρίου παραμένει εὐσεβέσιν,¶ καὶ ἡ εὐδοκία αὐτοῦ εἰς τὸν αἰῶνα εὐοδααοθήσεται. | true |
| 12:16 | καὶ ἐν τοῖς χείλεσιν αὐτοῦ γλυκανεῖ ὁ ἐχθρός, καὶ ἐν τῇ καρδίᾳ αὐτοῦ βουλεύσεται ἀνατρέψαι σε εἰς βόθρον· (16)ἐν ὀφθαλμοῖς αὐτοῦ δακρύσει ὁ ἐχθρός, καὶ ἐὰν εὕρῃ καιρόν, οὐκ ἐμπλησθήσεται ἀφʼ αἵματος· | καὶ ἐν τοῖς χείλεσιν αὐτοῦ γλυκανεῖ ὁ ἐχθρός, καὶ ἐν τῇ καρδίᾳ αὐτοῦ βουλεύσεται ἀνατρέψαι σε εἰς βόθρον· (16)ἐν ὀφθαλμοῖς αὐτοῦ δακρύσει ὁ ἐχθρός, §καὶ ἐὰν εὕρῃ καιρόν, οὐκ ἐμπλησθήσεται ἀφʼ αἵματος· | true |
| 17:12 | ¹²διαθήκην αἰῶνος ἔστησεν μετʼ αὐτῶν, καὶ τὰ κρίματα αὐτοῦ ὑπέδειξεν αὐτοῖς· | §¹²διαθήκην αἰῶνος ἔστησεν μετʼ αὐτῶν, καὶ τὰ κρίματα αὐτοῦ ὑπέδειξεν αὐτοῖς· | true |
| 20:5 | ἔστιν σιωπῶν εὑρισκομενος σοφός, καὶ ἔστιν μισητὸς ἀπὸ πολλῆς λαλιᾶς. | ἔστιν σιωπῶν εὑρισκομενος σοφός,¶ καὶ ἔστιν μισητὸς ἀπὸ πολλῆς λαλιᾶς. | true |
| 21:12 | 12οὐ παιδευθήσεται ὃς οὐκ ἔστιν πανοῦργος· (15)ἔστιν πανουργία πληθύνουσα πικρίαν. | §12οὐ παιδευθήσεται ὃς οὐκ ἔστιν πανοῦργος· (15)ἔστιν πανουργία πληθύνουσα πικρίαν. | true |
| 22:19 | ὁ νύσσων ὀφθαλμὸν κατάξει δάκρυα, καὶ νύσσων καρδίαν ἐκφαίνει αἴσθησιν. | ὁ νύσσων ὀφθαλμὸν κατάξει δάκρυα, καὶ νύσσων καρδίαν ἐκφαίνει αἴσθησιν.¶ | true |
| 22:22 | φίλον (27)ἐὸν ἀνοίξῃς στόμα, μὴ εὐλαβηθῇς, ἔστιν γὰρ διαλλαγή· πλὴν ὀνειδισμοῦ καὶ ὑπερηφανίας καὶ μυστηρίου ἀποκαλύψεως καὶ πληγῆς δολίας· ἐν τούτοις ἀποφεύξεται πᾶς φίλος. | φίλον (27)ἐὸν ἀνοίξῃς στόμα, μὴ εὐλαβηθῇς, ἔστιν γὰρ διαλλαγή· πλὴν ὀνειδισμοῦ καὶ ὑπερηφανίας καὶ μυστηρίου ἀποκα- λύψεως καὶ πληγῆς δολίας· ἐν τούτοις ἀποφεύξεται πᾶς φίλος. | true |
| 27:19 | 19καὶ ὡς πετεινὸν ἐκ χειρός σου ἀπέλυσας, οὕτως ἀφῆκας τὸν πλησίον, καὶ οὐ θηρεύσεις αὐτόν. | §19καὶ ὡς πετεινὸν ἐκ χειρός σου ἀπέλυσας, οὕτως ἀφῆκας τὸν πλησίον, καὶ οὐ θηρεύσεις αὐτόν. | true |

### DAN first 10 differing verses

| Ref | A observed | B observed | Diagnostic projection equal? |
| --- | --- | --- | --- |
| 1:11 | καὶ εἶπεν Δανιὴλ πρὸς Ἀμελσάδ, ὃν κατέστησεν ὁ ἀρχιευνοῦχος ἐπὶ Δανιήλ, Ἁνανίαν, Μεισαήλ, Ἀζαρίαν | καὶ εἶπεν ¶ Δανιὴλ πρὸς Ἀμελσάδ, ὃν κατέστησεν ὁ ἀρχιευνοῦχος ἐπὶ Δανιήλ, Ἁνανίαν, Μεισαήλ, Ἀζαρίαν | true |
| 2:35 | τότε ἐλεπτύνθησαν εἰς ἅπαξ τὸ ὄστρακον, ὁ σίδηρος, ὁ χαλκός, ὁ ἄργυρος, ὁ χυυσός, καὶ ἐγένετο ὡσεὶ κονιορτὸς ἀπὸ ἄλωνος θερινῆς· καὶ ἐξῆρεν τὸ πλῆθος τοῦ πνεύματος, καὶ τόπος οὐχ εὑρέθη αὐτοῖς· καὶ ὁ  | τότε ἐλεπτύνθησαν εἰς ἅπαξ τὸ ὄστρα- κον, ὁ σίδηρος, ὁ χαλκός, ὁ ἄργυρος, ὁ χυυσός, καὶ ἐγένετο ὡσεὶ κονιορτὸς ἀπὸ ἄλωνος θερινῆς· καὶ ἐξῆρεν τὸ πλῆθος τοῦ πνεύματος, καὶ τόπος οὐχ εὑρέθη αὐτοῖς· καὶ  | true |
| 3:5 | ᾖ ἂν ὥρᾳ ἀκούσητε φωνῆς σάλπιγγος, σύριγγός τε καὶ κιθάρας, σαμβύκης καὶ ψαλτηρίου καὶ παντὸς γένους μουσικῶν, πίπτοντες προσκυνεῖτε τῇ εἰκόνι τῇ χρυσῇ ἦ ἔστησεν Ναβουχοδονοσὸρ ὁ βασιλεύς· | ᾖ ἂν ὥρᾳ ἀκούσητε φωνῆς σάλπιγγος, σύριγγός τε καὶ κιθάρας, σαμβύκης καὶ ψαλτηρίου καὶ παντὸς γένους μουσικῶν, πίπτοντες προσκυνεῖτε τῇ εἰκόνι ¶ τῇ χρυσῇ ἦ ἔστησεν Ναβουχοδονοσὸρ ὁ βασιλεύς· | true |
| 3:37 | ὅτι, δέσποτα, ἐσμικρύνθημεν παρὰ πάντα τὰ ἔθνη, καί ἐσμεν ταπεινοὶ ἐν πάσῃ τῇ γῇ σήμερον διὰ τὰς ἁμαρτίας ἡμῶν. | ὅτι, δέσποτα, ἐσμικρύνθημεν παρὰ πάντα τὰ ἔθνη, καί § ἐσμεν ταπεινοὶ ἐν πάσῃ τῇ γῇ σήμερον διὰ τὰς ἁμαρτίας ἡμῶν. | true |
| 3:52 | ⁵²Εὐλογητὸς εἶ, Κύριε ὁ θ??ὸς τῶν πατέρων ἡμῶν, καὶ αἰνετὸς καὶ ὑπερυψούμενος εἰς τοὺς αἰῶνας· καὶ εὐλογημένον τὸ ὄνομα τῆς δόξης σου τὸ ἅγιον, καὶ ὑπεραινετὸν καὶ ὑπερυψούμενον εἰς πάντας τοὺς αἰῶνας | ⁵²Εὐλογητὸς εἶ, Κύριε ὁ θ??ὸς τῶν πατέρων ἡμῶν, καὶ αἰνετὸς καὶ ὑπερυψούμενος εἰς τοὺς αἰῶνας· καὶ εὐλογημένον τὸ ὄνομα τῆς δόξης σου τὸ ἅγιον, καὶ ὑπεραινετὸν καὶ ὑπερυψούμενον¶ εἰς πάντας τοὺς αἰῶνα | true |
| 3:54 | ⁵⁴εὐλογημένος εἶ ὁ ἐπιβλέπων ἀβύσσους, καθήμενος ἐπὶ χερουβείν, καὶ αἰνετὸς καὶ ὑπερυψαωμένος εἰς τοὺς αἰῶνας. | ⁵⁴εὐλογημένος εἶ ὁ ἐπιβλέπων ἀβύσσους, καθήμενος ἐπὶ χερου- βείν, καὶ αἰνετὸς καὶ ὑπερυψαωμένος εἰς τοὺς αἰῶνας. | true |
| 4:20 | καὶ ὅτι ἴδεν ὁ βασιλεὺς εἰρ καὶ ἅγιον καταβαίνοντα ἀπὸ τοῦ οὐρανοῦ· καὶ εἶπεν Ἐκτίλατε τὸ δένδρον καὶ διαφθείρατε αὐτό, πλὴν τὴν φυὴν τῶν όιζῶν αὐτοῦ ἐάσατε ἐν τῇ γῆ. καὶ ἐν δεσμῷ σιδηρῷ καὶ ἐν χαλκῷ  | καὶ ὅτι ἴδεν ὁ βασιλεὺς εἰρ καὶ ἅγιον καταβαίνοντα ἀπὸ τοῦ οὐρανοῦ· καὶ εἶπεν Ἐκτί- λατε τὸ δένδρον καὶ διαφθείρατε αὐτό, πλὴν τὴν φυὴν τῶν όιζῶν αὐτοῦ ἐάσατε ἐν τῇ γῆ. καὶ ἐν δεσμῷ σιδηρῷ καὶ ἐν χαλκ | true |
| 4:29 | καὶ ἀπὸ τῶν ἀνθρώπων σε ἐκδιώκουσιν, καὶ μετὰ θηρίων ἀγρίων ἡ κατοικία σου, καὶ χόρτον ὡς βοῦν ψωμιοῦσίν σε, καὶ ἑπτὰ καιροὶ ἀλλαγήσονται ἐπὶ σέ, ἕως γνῷς ὅτι κυριεύει ὁ ὕψιστος τῆς βασιλείας τῶν ἀνθρ | καὶ ἀπὸ τῶν ἀνθρώπων σε ἐκδιώκουσιν, καὶ μετὰ θηρίων ἀγρίων ἡ κατοικία σου, καὶ χόρτον ὡς βοῦν ψωμιοῦσίν σε, καὶ ἑπτὰ καιροὶ ἀλλαγήσονται ἐπὶ σέ, ἕως γνῷς ὅτι κυριεύει ὁ ὕψιστος τῆς βα- σιλείας τῶν ἀν | true |
| 5:22 | καὶ σὺ οὖν ὁ υἱὸς αὐτοῦ Βαλτασὰρ οὐκ ἐταπείνωσας τὴν καρδίαν σου κατενώπιον τοῦ θκοῦ · οὐ πάντα ταῦτα ἔγνως· | καὶ σὺ οὖν ὁ υἱὸς αὐτοῦ Βαλτασὰρ οὐκ ἐταπείνωσας τὴν καρδίαν σου κατενώπιον τοῦ θκοῦ· οὐ πάντα ταῦτα ἔγνως· | false |
| 5:23 | καὶ ἐπὶ τὸν κύριον θεὸν τοῦ οὐρανοῦ ὑψώθης, καὶ τὰ σκεύη τοῦ οἴκου αὐτοῦ ἤνεγκας ἐνώπιόν σου, καὶ σὺ καὶ οἱ μεγιστᾶνές σου καὶ αἱ παλλακαί σου καὶ αἵ παράκοιτοί σου οἶνον ἐπίνετε ἐν αὐτοῖς· καὶ τοὺς θ | καὶ ἐπὶ τὸν κύριον θεὸν τοῦ οὐρανοῦ ὑψώθης, καὶ τὰ σκεύη τοῦ οἴκου αὐτοῦ ἤνεγκας ἐνώπιόν σου, καὶ σὺ καὶ οἱ μεγιστᾶνές σου καὶ αἱ παλλακαί σου καὶ αἵ παράκοιτοί σου οἶνον ἐπίνετε ἐν αὐτοῖς· καὶ τοὺς θ | true |

## Edition identity: Isaiah in A is not a reliable Swete witness


B Isaiah grc1 names Swete; grc2 names Richard Rusden Ottley, Codex Alexandrinus, 1904. B Sirach grc1 names John Henry Arthur Hart, Codex 248, 1909; grc2 names Swete. A build.sh processes every grc XML and converter chooses one destination per book ID, allowing alternate editions to overwrite one another. A Sirach matches Swete grc2 closely; A Isaiah matches Ottley grc2 much more closely than Swete grc1. Do not label the whole A corpus as uniformly Swete.

{"A":"data/48.Isaias.txt","B":"data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc2.xml","union":1279,"Aonly":1,"Bonly":0,"equalWhitespaceNFC":1234,"equalDiagnosticProjection":1252,"different":44}

## Special components, detached text and duplicate references


### A

| File | Chapter labels | Verse records | Zero/nonnumeric references | Detached body text / headings |
| --- | --- | --- | --- | --- |
| data/19.Esther.txt | prologue,1,2,3,4,5,6,7,8,9,10 | 266 |  | [] |
| data/28.Odae.txt | 1,2,3,iva,ivb,5,6,7,8,9,10,11,12,13,14 | 238 |  | [] |
| data/52.Epistula_Jeremiae.txt | 0 | 73 |  | [] |
| data/54.Susanna_translatio_Graeca.txt | 1 | 46 |  | [] |
| data/55.Susanna_Theodotionis_versio.txt | 1 | 64 |  | [] |
| data/56.Daniel_translatio_Graeca.txt | 1,2,3,4,5,6,7,8,9,10,11,12 | 416 |  | [] |
| data/57.Daniel_Theodotionis_versio.txt | 1,2,3,4,5,6,7,8,9,10,11,12 | 412 |  | [] |
| data/58.Bel_et_Draco_translatio_Graeca.txt | 1 | 35 |  | [] |
| data/59.Bel_et_Draco_Theodotionis_versio.txt | 1 | 36 |  | [] |

Duplicate verse references: []

### B

| File | Chapter labels | Verse records | Zero/nonnumeric references | Detached body text / headings |
| --- | --- | --- | --- | --- |
| data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml | prologue,1,2,3,4,5,6,7,8,9,10 | 266 |  | [{"chapter":"","text":"EΣΘΗΡ"}] |
| data/tlg0527/tlg028/tlg0527.tlg028.1st1K-grc1.xml | 1,2,3,iva,ivb,5,6,7,8,9,10,11,12,13,14 | 228 |  | [{"chapter":"1","text":"ᾨδὴ Μωυσέως ἐν τῇ Ἐξόδῳ"},{"chapter":"2","text":"ᾨδὴ Μωυσέως ἐν τῷ Δευτερονομίῳ."},{"chapter":"3","text":"ροσευχὴ Ἄννας μητρὸς Σαμουὴλ."},{"chapter":"iva","text":"ᾨδὴ Ἠσαίου."},{"chapter":"ivb","text":"Δ΄ (β)"},{"chapter":"ivb","text":"§ Προσευχὴ Ἠσαίοι."},{"chapter":"5","text":"§Προσευχὴ Ἰωνᾶ."},{"chapter":"7","text":"Ποοσευχὴ Ἐζεκίου."},{"chapter":"8","text":"Προσευχὴ Μαννασσή."},{"chapter":"9","text":"Προσευχὴ Ἀζαρίου"},{"chapter":"11","text":"ΙΙροσευχὴ Μαρίας τῆς θεοτόκου."},{"chapter":"12","text":"Προσευχὴ Συμεών."},{"chapter":"13","text":"Προσευχὴ Ζαχαρίου."},{"chapter":"14","text":"Ὕμνος ἑωθινός."},{"chapter":"14","text":"Δόξα ἐν ὑψίστοις θεῷ,"},{"chapter":"14","text":"καὶ ἐπὶ γῆς εἰρήνη,"},{"chapter":"14","text":"ἐν ἀνθρώποις εὐδοκίᾳ"},{"chapter":"14","text":"αἰνοῦμέν σε,"},{"chapter":"14","text":"εὐλογοίμέν σε,"},{"chapter":"14","text":"προσκυνοῦμέν σε,"},{"chapter":"14","text":"δοξολογοῦμέν σε,"},{"chapter":"14","text":"εὐχαριστοῦμέν σοι,"},{"chapter":"14","text":"διὰ τὴν μεγάλην σου δόξαν,"},{"chapter":"14","text":"Κύριε βασιλεῦ"},{"chapter":"14","text":"ἐπουράνιε,"},{"chapter":"14","text":"θεὲ πατὴρ παντοκράτωρ·"},{"chapter":"14","text":"Κύριε υἱέ μονογενῆ"},{"chapter":"14","text":"Ἰησοῦ Χριστέ,"},{"chapter":"14","text":"καὶ ἅγιον πνεῦμα."},{"chapter":"14","text":"Κύριε ὁ θεός,"}] |
| data/tlg0527/tlg052/tlg0527.tlg052.1st1K-grc1.xml |  | 72 |  | [{"chapter":"","text":"ANΤΙΓΡΑΦΟΝ ἐπιστολῆς ἧς ἀπέστειλεν Ἱερεμίας πρὸς τοὺς ἁχόησομένους"},{"chapter":"","text":"αἰχμαλώτους εἰς Βαβυλῶνα ὑπὸ τοῦ βασιλέως τῶν Βαβυλωνίων, ἀναγγεῖλαι αὐτοῖς καθότι ἐπετάγη αὐτῷ ὑπὸ τοῦ θεοῦ."},{"chapter":"","text":"ΕΠΙΤΟΛΗΙΕΡΕΜΙΟΥ"}] |
| data/tlg0527/tlg054/tlg0527.tlg054.1st1K-grc1.xml | 1 | 46 |  | [{"chapter":"","text":"ΣΟYΣΑΝΝΑ LXX"},{"chapter":"1","text":"κατα τουU+03F2 ο΄"}] |
| data/tlg0527/tlg055/tlg0527.tlg055.1st1K-grc1.xml | 1 | 64 |  | [{"chapter":"","text":"ΣΟΥΣΑΝΝΑ κατα Θεοδοτιωνα"},{"chapter":"1","text":"κατα Θεοδοτιωνα"}] |
| data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | 1,2,3,4,5,6,7,8,9,10,11,12 | 416 |  | [{"chapter":"","text":"ΔΑΝΙΗΛ LXX"},{"chapter":"1","text":"κατα τουU+03F2 ο΄"}] |
| data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | 1,2,3,4,5,6,7,8,9,10,11,12 | 412 |  | [{"chapter":"","text":"ΔΑΝΙΗΛ κατα Θεοδοτιωνα"},{"chapter":"1","text":"κατα Θεοδοτιωνα"}] |
| data/tlg0527/tlg058/tlg0527.tlg058.1st1K-grc1.xml | 1 | 35 |  | [{"chapter":"","text":"BHΔ ΚΑΙ ΔΡΑΚΩΝ LXX"},{"chapter":"1","text":"κατα τουU+03F2 ο΄"}] |
| data/tlg0527/tlg059/tlg0527.tlg059.1st1K-grc1.xml | 1 | 36 |  | [{"chapter":"","text":"ΒΗΛ ΚΑΙ ΔΡΑΚΩΝ κατα Θεοδοτιωνα"},{"chapter":"1","text":"κατα Θεοδοτιωνα"}] |

Duplicate verse references: []

Direct B Odes evidence: chapter 8 has detached text “Προσευχὴ Μαννασσή.”; chapter 12 has “Προσευχὴ Συμεών.” A converter can attach detached body titles to the preceding verse reference. Letter of Jeremiah B has 72 verse containers and no chapter container; A assigns chapter 0 with a prose introduction at 0:0. These are distinct structural observations, not a proposed 73-verse repair. Esther has numbered sublabels such as 1a,2a; full chapter table preserves those labels. Both Daniel witnesses have chapter 3 additions; Susanna and Bel remain separate files.

## REJECTIONS and limits


- Reject A as a uniformly Swete/verbatim preservation source: Isaiah edition contamination, all book files missing license headers, and upstream deletion of editorial brackets/markers. The README grants CC BY-SA 4.0 for data; missing headers do not imply no permission.
- Reject the claim A and current B are identical: five-book verse differences and alternate Isaiah comparison are above. Both preserve suspicious OCR/script-mixing; no corrections made.
- Reject immediate shipping of B: XML apparatus, editorial signs, detached body text, nonstandard references, empty verses and structural divergences require policy and review.
- Reject forcing LXX into current canon counts: Psalms, Jeremiah and additions require evidence-based passage mappings; counts alone cannot prove semantics.
- Reject an assumed constant Psalm offset. Exact observed labels/counts and nonconstant candidate mapping are above; exact semantic verse alignment remains unverified.
- CrossWire/CCAT was not a fetched candidate and is not used.
- Artifact checks are heuristic; unmarked omission/corruption cannot be exhaustively detected by byte inspection. Label holes are recorded rather than filled.

Canon snapshot SHA-256: 43b872548d902238cb0584fc55e6c3b81861e6d9ec14e1a240da722b9652f094

## A missing canon chapters and reference exceptions

| Book/file | Missing canon chapters | Numbered verse holes | Zero/nonnumeric labels |
| --- | --- | --- | --- |
| GEN data/01.Genesis.txt |  | 31:51 |  |
| EXO data/02.Exodus.txt |  | 4:26 |  |
| LEV data/03.Leviticus.txt |  |  |  |
| NUM data/04.Numeri.txt |  |  |  |
| DEU data/05.Deuteronomium.txt |  | 23:2,12; 25:16 |  |
| JOS data/06.Josue.txt |  | 8:13,26; 20:4,5,6 | 15:59a; 19:48a,47a; 21:42a,42b,42c,42d; 24:30a,33a,33b |
| JDG data/08.Judices.txt |  |  |  |
| RUT data/10.Ruth.txt |  |  |  |
| 1SA data/11.Regnorum_I.txt |  | 13:1; 17:12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,50; 18:1,2,3,4,5,10,11,17,18,19 |  |
| 2SA data/12.Regnorum_II.txt |  | 23:30 | 23:30a,31a |
| 1KI data/13.Regnorum_III.txt |  | 3:1; 8:12,13; 9:15,16,17,18,19,20,21,22,23,24,25; 12:2; 13:27; 14:2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20; 15:6,32; 20:11,12; 22:47,48,49,50 | 2:35a,35b,35c,35d,35e,35f,35g,35h,35I,35k,35i,35m,35n,35o,46a,46b,46c,46d,46e,46f,46g,46n,46i,46j,46l; 8:53a; 12:24a,24b,24c,24d,24e,24f,24g,24h,24i,24j,24k,24l,24m,24n,24o,24p,24q,24r,24s,24t,24u,24x,24y,24z; 16:28a,28b,28c,28d,28e,28f,28g,28h |
| 2KI data/14.Regnorum_IV.txt |  | 25:10 | 1:18a,18b,18c,18d |
| 1CH data/15.Paralipomenon_I.txt |  | 1:11,12,13,14,15,16,18,19,20,21,22,23,48; 6:73; 12:8; 16:24,39,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92; 20:3; 24:24; 27:7; 28:3 |  |
| 2CH data/16.Paralipomenon_II.txt |  | 3:12; 4:20,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219; 11:3,16; 17:11,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110; 27:5; 31:3; 33:7 | 35:19a,19b,19c,19d; 36:2a,2b,2c,4a,5a,5b,5c,5d |
| EZR data/18.Esdras_B.txt |  | 2:16,22,39; 5:5; 6:20; 8:5 |  |
| NEH data/18.Esdras_B.txt |  | 13:7; 14:11; 17:26,27,68,69,74,75,76,77,78; 18:3; 20:11; 21:16,20,21,28,29,32,33,34,35; 22:4,5,6,9,15,16,17,18,19,20,21,38,40,41 |  |
| EST data/19.Esther.txt |  | 4:6; 5:1,2; 9:5 | 3:1a,2a,3a,4a,5a,6a,7a; 4:1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,1a1,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a,25a,26a,27a,28a,29a,30a,1b,2b,3b,4b,5b,6b,7b,8b,9b,10b,11b,12b,13b,14b,15b,16b; 8:1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,11a,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a; 10:1a,2a,3a |
| JDT data/20.Judith.txt |  | 3:2; 9:14,15,16,17,18 |  |
| TOB data/21.Tobias.txt |  | 1:8 |  |
| 1MA data/23.Machabaeorum_i.txt |  | 1:26; 4:8; 9:27 |  |
| 2MA data/24.Machabaeorum_ii.txt |  | 7:37; 11:30 |  |
| PSA data/27.Psalmi.txt |  | 14:6; 22:7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31; 24:14; 25:13,14,15,16,17,18,19,20,21; 27:10,11,12,13; 31:12,13,14,15,16,17,18,19,20,21,22,23,24; 42:6,7,8,9,10,11; 43:8; 47:7; 54:6; 63:3; 71:21,22,23; 73:24,25,26,27; 78:14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71; 81:9,10,11,12,13,14,15,16; 86:8,9,10,11,12,13,14,15,16; 88:48,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83; 89:18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52; 92:6,7,8,9,10,11,12,13,14; 94:12,13,14,15,16,17,18,19,20,21,22; 97:10,11; 99:6,7,8; 102:23,24,25,26,27,28; 109:8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30; 114:10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25; 115:6; 116:3,4,5,6,7,8,9; 117:4; 118:19,28,30,32,34,35,51,131,133; 119:4,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175; 122:5,6,7,8; 124:6,7; 130:4,5,6,7; 132:4,5,6,7,8,9,10,11,12,13,14,15,16,17; 135:23; 136:10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25; 140:11,12,13; 145:11,12,13,14,15,16,17,18,19,20; 147:10; 149:10,11,12,13; 150:7,8 |  |
| PRO data/29.Proverbia.txt | 30,31 | 1:16; 4:7; 7:18; 8:33; 11:4; 13:6; 21:5; 22:6,27; 23:23; 24:23 | 3:16a,22a; 4:27a,27b; 6:8a,8b,8c,11a; 7:1a; 8:21a; 9:12a,12b,12c,18a,18b,18c; 10:4a; 12:11a,13a; 13:9a,13a; 15:18a; 17:6a; 18:22a; 22:8a,9a,14a; 24:22a,22b,22c,22d,22e; 25:10a,29a; 26:11a; 27:20a,21a; 28:17a |
| SNG data/31.Canticum.txt |  | 4:8 |  |
| JOB data/32.Job.txt |  | 7:15; 14:7; 16:24,25,26,27,28,29,30,31,32,33,34; 33:32; 35:3 | 2:9a,9b,9c,9d; 19:4a; 36:28a,28b; 42:17a,17b,17c,17d,17e |
| WIS data/33.Sapientia_Salomonis.txt | 15 | 3:5,6,7,8,9,10,11,12,13,14,15,16,17 |  |
| SIR data/34.Ecclesiasticus.txt |  | 1:5,8,13,21; 3:19,24; 7:16,17; 10:21; 11:15,16; 13:14; 16:15,16; 17:5,16,18,21; 18:3; 19:18,19,21; 20:3; 22:9,10; 24:18,24; 25:12; 26:19,20,21,22,23,24,25,26,27; 29:17; 30:18; 33:16,17,18,19,20,21,22,23,24; 36:13,14,15,16; 40:30 | 7:16a,17a,16b,17b; 30:13b; 33:16a; 36:13a,16b |
| HOS data/36.Osee.txt |  |  |  |
| AMO data/37.Amos.txt |  |  |  |
| MIC data/38.Michaeas.txt |  |  |  |
| JOL data/39.Joel.txt |  |  |  |
| OBA data/40.Abdias.txt |  |  | 1:0 |
| JON data/41.Jonas.txt |  |  |  |
| NAM data/42.Nahum.txt |  |  |  |
| HAB data/43.Habacuc.txt |  |  |  |
| ZEP data/44.Sophonias.txt |  | 3:13 |  |
| HAG data/45.Aggaeus.txt |  |  |  |
| ZEC data/46.Zacharias.txt |  | 11:17; 12:12 |  |
| MAL data/47.Malachias.txt |  |  |  |
| ISA data/48.Isaias.txt |  | 38:15; 40:7 | 1:0 |
| JER data/49.Jeremias.txt |  | 2:1,6; 7:1,27; 8:11,12; 10:5,6,7,8,10; 11:7; 17:1,2,3,4; 23:30,31; 26:7,26; 28:45,46,47,48; 36:16,17,18,19,20; 37:10,11,15,22; 46:4,5,6,7,8,9,10,11,12,13; 48:11; 52:2,3,9,15,28,29,30 | 10:5a,5b; 48:11s |
| BAR data/50.Baruch.txt | 6 |  |  |
| LAM data/51.Threni_seu_Lamentationes.txt |  | 3:22,23,24,29 | 1:0 |
| EZK data/53.Ezechiel.txt |  | 1:14; 7:10,11; 8:2; 10:14; 11:11,12; 23:3; 27:31; 32:19; 33:26; 40:30 | 7:11s |
| DAN data/56.Daniel_translatio_Graeca.txt | 13,14 | 4:3,4,5,6,31,32; 5:14,15,18,19,20,21,22,24,25; 6:8 | 4:14a,30a,30b,30c,34a,34b,34c; 6:12a |
| DAN data/57.Daniel_Theodotionis_versio.txt | 13,14 | 3:71,72; 10:8 |  |

## B missing canon chapters and reference exceptions

| Book/file | Missing canon chapters | Numbered verse holes | Zero/nonnumeric labels |
| --- | --- | --- | --- |
| GEN data/tlg0527/tlg001/tlg0527.tlg001.1st1K-grc1.xml |  | 31:51 |  |
| EXO data/tlg0527/tlg002/tlg0527.tlg002.1st1K-grc1.xml |  | 4:26 |  |
| LEV data/tlg0527/tlg003/tlg0527.tlg003.1st1K-grc1.xml |  |  |  |
| NUM data/tlg0527/tlg004/tlg0527.tlg004.1st1K-grc1.xml |  |  |  |
| DEU data/tlg0527/tlg005/tlg0527.tlg005.1st1K-grc1.xml |  | 23:2,12; 25:16 |  |
| JOS data/tlg0527/tlg006/tlg0527.tlg006.1st1K-grc1.xml |  | 8:13,26; 20:4,5,6 | 15:59a; 19:48a,47a; 21:42a,42b,42c,42d; 24:30a,33a,33b |
| JDG data/tlg0527/tlg008/tlg0527.tlg008.1st1K-grc1.xml |  |  |  |
| RUT data/tlg0527/tlg010/tlg0527.tlg010.1st1K-grc1.xml |  |  |  |
| 1SA data/tlg0527/tlg011/tlg0527.tlg011.1st1K-grc1.xml |  | 17:12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,50; 18:2,3,4,5,10,11,17,18,19 |  |
| 2SA data/tlg0527/tlg012/tlg0527.tlg012.1st1K-grc1.xml |  | 23:30 | 23:30a,31a |
| 1KI data/tlg0527/tlg013/tlg0527.tlg013.1st1K-grc1.xml |  | 8:12,13; 9:15,16,17,18,19,20,21,22,23,24,25; 12:2; 13:27; 14:2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20; 15:6,32; 20:11,12; 22:47,48,49,50 | 2:35a,35b,35c,35d,35e,35f,35g,35h,35I,35k,35i,35m,35n,35o,46a,46b,46c,46d,46e,46f,46g,46n,46i,46j,46l; 8:53a; 12:24a,24b,24c,24d,24e,24f,24g,24h,24i,24j,24k,24l,24m,24n,24o,24p,24q,24r,24s,24t,24u,24x,24y,24z; 16:28a,28b,28c,28d,28e,28f,28g,28h |
| 2KI data/tlg0527/tlg014/tlg0527.tlg014.1st1K-grc1.xml |  | 25:10 | 1:18a,18b,18c,18d |
| 1CH data/tlg0527/tlg015/tlg0527.tlg015.1st1K-grc1.xml |  | 1:11,12,13,14,15,16,18,19,20,21,22,23,48; 6:73; 12:8; 16:24,39,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92; 20:3; 24:24; 27:7; 28:3 |  |
| 2CH data/tlg0527/tlg016/tlg0527.tlg016.1st1K-grc1.xml |  | 3:12; 4:20,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219; 11:3,16; 17:11,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110; 27:5; 31:3; 33:7 | 35:19a,19b,19c,19d; 36:2a,2b,2c,4a,5a,5b,5c,5d |
| EZR data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml |  | 2:16,22,39; 5:5; 6:20; 8:5 |  |
| NEH data/tlg0527/tlg018/tlg0527.tlg018.1st1K-grc1.xml |  | 13:7; 14:11; 17:26,27,68,69,74,75,76,77,78; 18:3; 20:11; 21:16,20,21,28,29,32,33,34,35; 22:4,5,6,9,15,16,17,18,19,20,21,38,40,41 |  |
| EST data/tlg0527/tlg019/tlg0527.tlg019.1st1K-grc1.xml |  | 4:6; 5:1,2; 9:5 | 3:1a,2a,3a,4a,5a,6a,7a; 4:1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,1a1,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a,25a,26a,27a,28a,29a,30a,1b,2b,3b,4b,5b,6b,7b,8b,9b,10b,11b,12b,13b,14b,15b,16b; 8:1a,2a,3a,4a,5a,6a,7a,8a,9a,10a,11a,12a,13a,14a,15a,16a,17a,18a,19a,20a,21a,22a,23a,24a; 10:1a,2a,3a |
| JDT data/tlg0527/tlg020/tlg0527.tlg020.1st1K-grc1.xml |  | 3:2; 9:14,15,16,17,18 |  |
| TOB data/tlg0527/tlg021/tlg0527.tlg021.1st1K-grc1.xml |  | 1:8 |  |
| 1MA data/tlg0527/tlg023/tlg0527.tlg023.1st1K-grc1.xml |  | 1:26; 4:8; 9:27 |  |
| 2MA data/tlg0527/tlg024/tlg0527.tlg024.1st1K-grc1.xml |  | 7:37; 11:30 |  |
| PSA data/tlg0527/tlg027/tlg0527.tlg027.1st1K-grc1.xml |  | 24:14; 43:8; 47:7; 54:6; 63:3; 88:48,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83; 115:6; 117:4; 118:19,28,29,30,32,34,35,51,131,133; 119:4; 135:23 |  |
| PRO data/tlg0527/tlg029/tlg0527.tlg029.1st1K-grc1.xml | 30,31 | 1:16; 4:7; 7:18; 8:33; 11:4; 13:6; 21:5; 22:6,27; 23:23; 24:23 | 3:16a,22a; 4:27a,27b; 6:8a,8b,8c,11a; 7:1a; 8:21a; 9:12a,12b,12c,18a,18b,18c; 10:4a; 12:11a,13a; 13:9a,13a; 15:18a; 17:6a; 18:22a; 22:8a,9a,14a; 24:22a,22b,22c,22d,22e; 25:10a,29a; 26:11a; 27:20a,21a; 28:17a |
| SNG data/tlg0527/tlg031/tlg0527.tlg031.1st1K-grc1.xml |  | 4:8 |  |
| JOB data/tlg0527/tlg032/tlg0527.tlg032.1st1K-grc1.xml |  | 7:15; 14:7; 33:32; 35:3 | 2:9a,9b,9c,9d; 19:4a; 36:28a,28b; 42:17a,17b,17c,17d,17e |
| WIS data/tlg0527/tlg033/tlg0527.tlg033.1st1K-grc1.xml | 15 | 3:5,6,7,8,9,10,11,12,13,14,15,16,17 |  |
| SIR data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc2.xml |  | 1:5,8,13,21; 3:19,24; 7:16,17; 10:21; 11:15,16; 13:14; 16:15,16; 17:5,16,18,21; 18:3; 19:18,19,21; 20:3; 22:9,10; 24:18,24; 25:12; 26:19,20,21,22,23,24,25,26,27; 29:17; 30:18; 33:16,17,18,19,20,21,22,23,24; 36:13,14,15,16; 40:30 | 7:16a,17a,16b,17b; 30:13b; 33:16a; 36:13a,16b |
| HOS data/tlg0527/tlg036/tlg0527.tlg036.1st1K-grc1.xml |  |  |  |
| AMO data/tlg0527/tlg037/tlg0527.tlg037.1st1K-grc1.xml |  |  |  |
| MIC data/tlg0527/tlg038/tlg0527.tlg038.1st1K-grc1.xml |  |  |  |
| JOL data/tlg0527/tlg039/tlg0527.tlg039.1st1K-grc1.xml |  |  |  |
| OBA data/tlg0527/tlg040/tlg0527.tlg040.1st1K-grc1.xml |  |  |  |
| JON data/tlg0527/tlg041/tlg0527.tlg041.1st1K-grc1.xml |  |  |  |
| NAM data/tlg0527/tlg042/tlg0527.tlg042.1st1K-grc1.xml |  |  |  |
| HAB data/tlg0527/tlg043/tlg0527.tlg043.1st1K-grc1.xml |  |  |  |
| ZEP data/tlg0527/tlg044/tlg0527.tlg044.1st1K-grc1.xml |  | 3:13 |  |
| HAG data/tlg0527/tlg045/tlg0527.tlg045.1st1K-grc1.xml |  |  |  |
| ZEC data/tlg0527/tlg046/tlg0527.tlg046.1st1K-grc1.xml |  | 11:17; 12:12 |  |
| MAL data/tlg0527/tlg047/tlg0527.tlg047.1st1K-grc1.xml |  |  |  |
| ISA data/tlg0527/tlg048/tlg0527.tlg048.1st1K-grc1.xml |  | 9:10; 13:20; 35:4; 37:11,15; 38:17; 43:19; 47:8; 49:13; 52:3; 65:21,22 | 32:head |
| JER data/tlg0527/tlg049/tlg0527.tlg049.1st1K-grc1.xml |  | 2:1,6; 7:1,27; 8:11,12; 10:5,6,7,8,10; 11:7; 17:1,2,3,4; 23:30,31; 26:7,26; 28:45,46,47,48; 36:16,17,18,19,20; 37:10,11,15,22; 46:4,5,6,7,8,9,10,11,12,13; 48:11; 52:2,3,9,15,28,29,30 | 10:5a,5b; 48:11s |
| BAR data/tlg0527/tlg050/tlg0527.tlg050.1st1K-grc1.xml | 6 |  |  |
| LAM data/tlg0527/tlg051/tlg0527.tlg051.1st1K-grc1.xml |  | 3:22,23,24,29 |  |
| EZK data/tlg0527/tlg053/tlg0527.tlg053.1st1K-grc1.xml |  | 1:14; 7:10,11; 8:2; 10:14; 11:11,12; 23:3; 27:31; 32:19; 33:26; 40:30 | 7:11s |
| DAN data/tlg0527/tlg056/tlg0527.tlg056.1st1K-grc1.xml | 13,14 | 4:3,4,5,6,31,32; 5:14,15,18,19,20,21,22,24,25; 6:8 | 4:14a,30a,30b,30c,34a,34b,34c; 6:12a |
| DAN data/tlg0527/tlg057/tlg0527.tlg057.1st1K-grc1.xml | 13,14 | 3:71,72; 10:8 |  |

## RECOMMENDATION


Prefer B (OpenGreekAndLatin/First1KGreek) as the auditable raw preservation source: each book carries its own license and original XML retains apparatus and editorial information. This is a source recommendation, not approval to import or a claim of clean Scripture. A is useful as a secondary comparison only.

## BLOCKERS


- Decide native LXX navigation versus explicit Catholic verse correspondence, including Psalms titles and split/merged Psalms; verify every semantic mapping. Jeremiah needs passage alignment, not a chapter offset.
- Decide Old Greek versus Theodotion for Daniel, Susanna and Bel; retain witness identity and never silently combine readings. Decide placement of Esther prologue and other additions, Letter of Jeremiah and Ezra/Nehemiah.
- Decide exclusion/disclosure for 1 Esdras, 3-4 Maccabees, Odes/Prayer of Manasseh, Psalms of Solomon and Psalm 151 under the 73-book scope; Ecclesiastes coverage is missing.
- Decide apparatus/heading/editorial-marker presentation. Preserve raw sources and references; any stripping must be explicit and must not repair Greek. Recorded OCR-like corruption and verse holes must be disclosed and reviewed before shipping.
- Provide attribution, license link, modification notice and CC BY-SA 4.0 for adapted transcription data. Obtain user approval before any importer work.

Reproduce: node build/audit-lxx.mjs --markdown (stdout only); node build/audit-lxx.mjs --json (machine-readable evidence); node build/audit-lxx.mjs (compact terminal report). fetch.mjs is the separate snapshot acquisition script and writes only this source folder; the audit script itself is read-only.

