colorList = [
        'rgb(224,39,235)', 'rgb(175,157,65)', 'rgb(88,2,128)', 'rgb(168,229,152)', 'rgb(140,6,51)', 'rgb(69,65,147)', 'rgb(186,2,193)', 'rgb(242,247,143)', 'rgb(191,42,172)', 'rgb(6,48,245)', 'rgb(121,239,129)', 'rgb(143,222,147)',
        'rgb(3,138,247)', 'rgb(179,226,222)', 'rgb(81,194,14)', 'rgb(183,217,12)', 'rgb(110,44,38)', 'rgb(94,94,25)', 'rgb(173,60,206)', 'rgb(176,121,173)', 'rgb(204,178,44)', 'rgb(178,210,201)', 'rgb(46,47,97)', 'rgb(254,11,56)',
        'rgb(216,65,200)', 'rgb(140,237,206)', 'rgb(89,60,28)', 'rgb(145,90,78)', 'rgb(202,5,196)', 'rgb(213,185,207)', 'rgb(132,226,140)', 'rgb(84,247,107)', 'rgb(94,224,28)', 'rgb(223,36,142)', 'rgb(16,202,249)', 'rgb(163,16,175)',
        'rgb(163,157,200)', 'rgb(201,168,56)', 'rgb(194,123,159)', 'rgb(166,85,180)', 'rgb(131,61,67)', 'rgb(28,37,153)', 'rgb(186,114,175)', 'rgb(122,39,240)', 'rgb(95,177,98)', 'rgb(169,78,12)', 'rgb(6,228,8)', 'rgb(179,236,87)',
        'rgb(20,88,124)', 'rgb(209,248,199)', 'rgb(90,136,151)', 'rgb(127,2,121)', 'rgb(109,21,4)', 'rgb(248,188,237)', 'rgb(245,184,233)', 'rgb(30,108,31)', 'rgb(110,19,72)', 'rgb(120,46,67)', 'rgb(32,96,158)', 'rgb(94,191,160)',
        'rgb(95,96,238)', 'rgb(187,147,8)', 'rgb(228,240,6)', 'rgb(32,240,240)', 'rgb(12,224,23)', 'rgb(124,16,66)', 'rgb(112,83,82)', 'rgb(195,24,250)', 'rgb(227,155,15)', 'rgb(6,134,160)', 'rgb(197,128,163)', 'rgb(78,8,155)',
        'rgb(232,22,254)', 'rgb(216,181,229)', 'rgb(195,234,107)', 'rgb(1,76,23)', 'rgb(14,41,142)', 'rgb(26,218,102)', 'rgb(83,144,175)', 'rgb(23,121,109)', 'rgb(135,109,169)', 'rgb(91,194,14)', 'rgb(140,39,54)', 'rgb(63,39,252)',
        'rgb(211,7,100)', 'rgb(191,30,246)', 'rgb(66,208,130)', 'rgb(8,153,63)', 'rgb(195,40,241)', 'rgb(210,195,79)', 'rgb(128,193,128)', 'rgb(249,98,8)', 'rgb(28,78,92)', 'rgb(197,147,71)', 'rgb(249,124,13)', 'rgb(68,22,104)',
        'rgb(201,31,69)', 'rgb(37,211,152)', 'rgb(237,21,152)', 'rgb(61,144,113)', 'rgb(23,120,201)', 'rgb(121,117,43)', 'rgb(2,27,151)', 'rgb(65,201,122)', 'rgb(226,38,177)', 'rgb(233,117,239)', 'rgb(166,193,103)', 'rgb(239,172,208)',
        'rgb(118,24,74)', 'rgb(30,56,69)', 'rgb(77,135,86)', 'rgb(27,215,126)', 'rgb(123,165,110)', 'rgb(180,40,254)', 'rgb(18,119,131)', 'rgb(162,106,14)', 'rgb(157,171,89)', 'rgb(47,199,237)', 'rgb(49,127,101)',
        'rgb(173,186,220)', 'rgb(205,43,233)', 'rgb(227,17,42)', 'rgb(70,14,103)', 'rgb(161,186,233)', 'rgb(117,215,137)', 'rgb(157,8,246)', 'rgb(146,211,100)', 'rgb(241,81,163)', 'rgb(32,76,35)', 'rgb(174,92,32)',
        'rgb(162,45,88)', 'rgb(134,139,117)', 'rgb(108,142,102)', 'rgb(229,36,245)', 'rgb(225,183,16)', 'rgb(191,206,223)', 'rgb(214,43,13)', 'rgb(32,237,144)', 'rgb(77,245,27)', 'rgb(59,119,227)', 'rgb(126,47,214)',
        'rgb(131,166,173)', 'rgb(74,246,92)', 'rgb(68,173,35)', 'rgb(40,189,90)', 'rgb(160,32,61)', 'rgb(132,59,183)', 'rgb(162,49,211)', 'rgb(115,142,31)', 'rgb(162,172,248)', 'rgb(85,90,50)', 'rgb(21,217,52)', 'rgb(228,231,177)',
        'rgb(203,43,234)', 'rgb(227,147,10)', 'rgb(40,76,16)', 'rgb(136,45,141)', 'rgb(157,12,11)', 'rgb(57,94,13)', 'rgb(198,204,205)', 'rgb(2,183,205)', 'rgb(80,44,231)', 'rgb(80,233,222)', 'rgb(156,44,189)', 'rgb(37,254,34)',
        'rgb(222,143,215)', 'rgb(220,187,146)', 'rgb(3,234,192)', 'rgb(153,23,176)', 'rgb(157,113,26)', 'rgb(85,120,156)', 'rgb(128,128,134)', 'rgb(143,5,146)', 'rgb(91,70,118)', 'rgb(136,111,251)', 'rgb(69,127,29)',
        'rgb(191,83,253)', 'rgb(20,138,153)', 'rgb(122,178,151)', 'rgb(169,114,152)', 'rgb(39,199,245)', 'rgb(116,60,199)', 'rgb(46,71,213)', 'rgb(243,28,170)', 'rgb(166,134,56)', 'rgb(209,181,84)', 'rgb(119,248,60)',
        'rgb(77,176,255)', 'rgb(61,196,251)', 'rgb(133,49,57)', 'rgb(215,49,53)', 'rgb(250,2,81)', 'rgb(30,152,242)', 'rgb(52,203,163)', 'rgb(6,110,232)', 'rgb(55,25,219)', 'rgb(102,103,75)', 'rgb(235,228,27)',
        'rgb(67,158,232)', 'rgb(81,23,102)', 'rgb(117,71,229)', 'rgb(245,165,207)', 'rgb(162,106,111)', 'rgb(138,138,70)', 'rgb(239,163,125)', 'rgb(251,66,39)', 'rgb(163,205,76)', 'rgb(127,187,4)', 'rgb(30,120,17)',
        'rgb(152,107,89)', 'rgb(201,143,55)', 'rgb(152,172,115)', 'rgb(105,82,126)', 'rgb(162,109,15)', 'rgb(136,21,0)', 'rgb(85,188,196)', 'rgb(107,196,164)', 'rgb(254,209,137)', 'rgb(60,86,124)', 'rgb(107,195,93)',
        'rgb(162,130,158)', 'rgb(91,129,217)', 'rgb(187,238,52)', 'rgb(5,129,211)', 'rgb(58,51,237)', 'rgb(89,20,86)', 'rgb(173,118,125)', 'rgb(3,87,221)', 'rgb(11,70,114)', 'rgb(161,196,64)', 'rgb(220,156,4)',
        'rgb(157,3,38)', 'rgb(213,199,202)', 'rgb(10,232,238)', 'rgb(108,178,120)', 'rgb(83,40,60)', 'rgb(143,14,184)', 'rgb(137,134,35)', 'rgb(213,135,121)', 'rgb(188,242,47)', 'rgb(133,221,135)', 'rgb(202,233,177)',
        'rgb(197,112,39)', 'rgb(40,84,34)', 'rgb(50,162,252)', 'rgb(41,193,77)', 'rgb(112,145,37)', 'rgb(173,184,164)', 'rgb(44,214,222)', 'rgb(48,61,8)', 'rgb(236,73,109)', 'rgb(89,92,194)', 'rgb(94,114,33)',
        'rgb(234,95,233)', 'rgb(38,144,38)', 'rgb(45,167,57)', 'rgb(108,199,123)', 'rgb(206,116,56)', 'rgb(225,37,214)', 'rgb(115,226,69)', 'rgb(90,114,167)', 'rgb(2,125,177)', 'rgb(163,105,243)', 'rgb(148,59,6)',
        'rgb(54,143,176)', 'rgb(131,167,95)', 'rgb(226,57,208)', 'rgb(174,166,44)', 'rgb(99,186,23)', 'rgb(20,220,111)', 'rgb(51,175,199)', 'rgb(221,251,144)', 'rgb(31,107,122)', 'rgb(128,8,82)', 'rgb(72,169,175)',
        'rgb(190,44,119)', 'rgb(161,108,205)', 'rgb(96,71,148)', 'rgb(35,233,98)', 'rgb(146,190,223)', 'rgb(65,24,212)', 'rgb(56,49,107)', 'rgb(122,3,171)', 'rgb(77,204,22)', 'rgb(57,69,19)', 'rgb(27,197,116)',
        'rgb(99,64,219)', 'rgb(183,97,160)', 'rgb(24,81,115)', 'rgb(10,156,89)', 'rgb(6,4,173)', 'rgb(104,205,138)', 'rgb(161,90,113)', 'rgb(249,195,157)', 'rgb(78,48,202)', 'rgb(150,95,114)', 'rgb(32,82,56)', 'rgb(154,107,5)',
        'rgb(159,220,8)', 'rgb(170,132,33)', 'rgb(198,12,156)', 'rgb(228,77,146)', 'rgb(156,134,244)', 'rgb(137,247,216)', 'rgb(80,232,94)', 'rgb(48,7,148)', 'rgb(27,101,93)', 'rgb(126,224,228)', 'rgb(204,236,134)', 'rgb(58,128,128)',
        'rgb(108,188,190)', 'rgb(85,255,102)', 'rgb(136,113,58)', 'rgb(248,66,111)', 'rgb(173,151,116)', 'rgb(102,170,170)', 'rgb(200,155,71)', 'rgb(48,226,130)', 'rgb(88,204,53)', 'rgb(77,79,34)', 'rgb(140,58,62)', 'rgb(3,226,190)',
        'rgb(132,185,21)', 'rgb(233,234,243)', 'rgb(10,252,105)', 'rgb(233,229,200)', 'rgb(82,212,117)', 'rgb(122,144,59)', 'rgb(64,102,194)', 'rgb(228,186,160)', 'rgb(218,169,83)', 'rgb(102,51,49)', 'rgb(73,69,164)', 'rgb(242,89,66)',
        'rgb(16,65,29)', 'rgb(172,126,11)', 'rgb(200,24,174)', 'rgb(144,225,11)', 'rgb(98,83,134)', 'rgb(78,19,55)', 'rgb(52,193,10)', 'rgb(99,140,72)', 'rgb(68,243,202)', 'rgb(219,27,238)', 'rgb(9,106,119)', 'rgb(205,64,246)',
        'rgb(112,1,248)', 'rgb(185,167,82)', 'rgb(236,120,71)', 'rgb(155,44,177)', 'rgb(98,253,6)', 'rgb(175,248,51)', 'rgb(6,8,193)', 'rgb(124,99,159)', 'rgb(58,81,7)', 'rgb(222,15,16)', 'rgb(80,70,110)', 'rgb(150,172,93)',
        'rgb(146,100,9)', 'rgb(73,70,132)', 'rgb(226,73,131)', 'rgb(171,4,171)', 'rgb(18,34,139)', 'rgb(146,72,166)', 'rgb(81,7,155)', 'rgb(229,26,42)', 'rgb(110,13,17)', 'rgb(119,20,92)', 'rgb(158,11,98)', 'rgb(17,212,213)',
        'rgb(20,8,216)', 'rgb(59,232,181)', 'rgb(163,76,130)', 'rgb(93,218,93)', 'rgb(47,160,135)', 'rgb(37,58,194)', 'rgb(234,156,45)', 'rgb(217,120,31)', 'rgb(97,26,195)', 'rgb(49,190,81)', 'rgb(21,171,227)', 'rgb(59,166,46)',
        'rgb(118,9,159)', 'rgb(75,145,159)', 'rgb(189,219,237)', 'rgb(224,20,160)', 'rgb(32,104,91)', 'rgb(15,210,3)', 'rgb(111,246,6)', 'rgb(144,64,140)', 'rgb(45,162,235)', 'rgb(255,152,219)', 'rgb(227,34,53)', 'rgb(220,171,87)',
        'rgb(125,55,99)', 'rgb(250,2,212)', 'rgb(35,230,149)', 'rgb(95,30,247)', 'rgb(36,113,162)', 'rgb(245,44,194)', 'rgb(234,237,2)', 'rgb(72,29,239)', 'rgb(168,20,227)', 'rgb(19,45,224)', 'rgb(98,165,186)', 'rgb(198,85,12)',
        'rgb(185,26,21)', 'rgb(41,70,99)', 'rgb(233,204,174)', 'rgb(107,121,203)', 'rgb(159,254,23)', 'rgb(71,167,183)', 'rgb(201,242,12)', 'rgb(219,39,19)', 'rgb(140,7,79)', 'rgb(14,62,158)', 'rgb(230,81,188)', 'rgb(72,39,217)',
        'rgb(12,7,160)', 'rgb(58,179,8)', 'rgb(248,252,12)', 'rgb(222,251,218)', 'rgb(181,159,240)', 'rgb(225,174,134)', 'rgb(169,54,44)', 'rgb(184,94,22)', 'rgb(128,60,26)', 'rgb(135,34,64)',
        'rgb(224,240,78)', 'rgb(229,96,106)', 'rgb(87,193,151)', 'rgb(61,228,78)', 'rgb(189,113,84)', 'rgb(216,70,93)', 'rgb(195,37,241)', 'rgb(166,130,107)', 'rgb(27,193,133)', 'rgb(164,102,88)', 'rgb(92,241,75)', 'rgb(174,186,154)',
        'rgb(88,149,94)', 'rgb(219,167,226)', 'rgb(54,78,110)', 'rgb(94,61,28)', 'rgb(132,90,10)', 'rgb(128,139,6)', 'rgb(162,208,169)', 'rgb(158,4,65)', 'rgb(10,227,67)', 'rgb(111,229,222)', 'rgb(192,38,220)', 'rgb(154,211,188)',
        'rgb(117,124,216)', 'rgb(197,40,80)', 'rgb(15,115,134)', 'rgb(87,150,253)', 'rgb(85,216,116)', 'rgb(127,213,112)', 'rgb(68,72,109)', 'rgb(36,162,142)', 'rgb(238,72,31)', 'rgb(114,61,241)', 'rgb(0,4,78)', 'rgb(24,232,146)',
        'rgb(61,101,91)', 'rgb(170,74,142)', 'rgb(91,98,13)', 'rgb(2,92,235)', 'rgb(15,63,19)', 'rgb(226,243,55)', 'rgb(64,19,63)', 'rgb(218,123,45)', 'rgb(109,223,108)', 'rgb(200,144,87)', 'rgb(114,9,176)', 'rgb(209,224,175)',
        'rgb(3,145,167)', 'rgb(120,248,40)', 'rgb(101,157,120)', 'rgb(100,123,32)', 'rgb(93,62,94)', 'rgb(163,32,248)', 'rgb(53,189,228)', 'rgb(56,89,228)', 'rgb(109,87,26)', 'rgb(113,143,69)', 'rgb(45,176,203)', 'rgb(17,246,177)',
        'rgb(116,95,51)', 'rgb(145,39,118)', 'rgb(214,136,177)', 'rgb(80,82,6)', 'rgb(254,233,234)', 'rgb(181,234,142)', 'rgb(40,106,148)', 'rgb(33,99,198)', 'rgb(169,106,242)', 'rgb(227,220,7)', 'rgb(73,102,129)', 'rgb(215,167,243)',
        'rgb(248,177,125)', 'rgb(129,213,157)', 'rgb(198,73,67)', 'rgb(123,113,50)', 'rgb(207,105,28)', 'rgb(68,81,135)', 'rgb(47,40,70)', 'rgb(154,169,193)', 'rgb(178,210,31)', 'rgb(194,191,74)', 'rgb(148,217,231)', 'rgb(245,46,205)',
        'rgb(239,79,40)', 'rgb(227,249,80)', 'rgb(53,53,211)', 'rgb(9,27,168)', 'rgb(246,208,155)', 'rgb(13,139,49)', 'rgb(250,184,147)', 'rgb(74,227,24)', 'rgb(209,17,89)', 'rgb(169,55,60)', 'rgb(208,182,114)', 'rgb(155,191,158)',
        'rgb(39,186,28)', 'rgb(188,62,124)', 'rgb(61,224,15)', 'rgb(116,31,130)', 'rgb(183,211,208)', 'rgb(231,238,135)', 'rgb(154,83,105)', 'rgb(61,50,193)', 'rgb(140,131,174)', 'rgb(133,14,12)', 'rgb(194,29,177)', 'rgb(45,38,185)',
        'rgb(12,148,228)', 'rgb(237,247,189)', 'rgb(180,217,220)', 'rgb(159,206,188)', 'rgb(211,146,152)', 'rgb(41,53,91)', 'rgb(114,25,57)', 'rgb(124,36,176)', 'rgb(192,92,139)', 'rgb(137,253,3)', 'rgb(58,51,227)', 'rgb(198,230,135)',
        'rgb(182,202,17)', 'rgb(42,133,117)', 'rgb(40,184,61)', 'rgb(108,143,8)', 'rgb(252,106,194)', 'rgb(238,230,47)', 'rgb(133,105,209)', 'rgb(4,57,246)', 'rgb(20,16,236)', 'rgb(45,194,120)', 'rgb(64,192,182)', 'rgb(208,159,151)',
        'rgb(219,54,37)', 'rgb(92,75,96)', 'rgb(158,84,196)', 'rgb(140,134,119)', 'rgb(186,5,162)', 'rgb(70,124,103)', 'rgb(158,179,127)', 'rgb(34,111,246)', 'rgb(141,137,10)', 'rgb(125,98,238)', 'rgb(101,72,119)', 'rgb(118,221,26)', 'rgb(182,234,45)', 'rgb(63,121,7)',
        'rgb(168,177,17)', 'rgb(173,65,211)', 'rgb(161,58,8)', 'rgb(195,58,134)', 'rgb(233,67,162)', 'rgb(30,217,178)', 'rgb(150,99,176)', 'rgb(109,125,162)', 'rgb(113,168,202)', 'rgb(12,23,20)', 'rgb(218,16,1)', 'rgb(98,89,69)',
        'rgb(112,85,98)', 'rgb(37,150,227)', 'rgb(142,240,229)', 'rgb(130,52,227)', 'rgb(58,53,90)', 'rgb(134,169,169)', 'rgb(50,14,162)', 'rgb(218,29,210)', 'rgb(135,85,67)', 'rgb(92,141,24)', 'rgb(188,213,10)', 'rgb(176,238,130)',
        'rgb(37,89,122)', 'rgb(6,199,146)', 'rgb(75,186,58)', 'rgb(217,226,46)', 'rgb(186,159,181)', 'rgb(70,107,87)', 'rgb(201,244,159)', 'rgb(87,29,155)', 'rgb(77,78,188)', 'rgb(135,217,138)', 'rgb(11,222,115)', 'rgb(71,57,117)',
        'rgb(8,78,44)', 'rgb(230,193,113)', 'rgb(159,155,220)', 'rgb(160,202,183)', 'rgb(226,195,200)', 'rgb(71,206,34)', 'rgb(127,72,183)', 'rgb(230,156,155)', 'rgb(49,108,178)', 'rgb(200,8,83)', 'rgb(102,17,145)', 'rgb(177,61,215)',
        'rgb(129,169,238)', 'rgb(86,166,84)', 'rgb(168,56,215)', 'rgb(31,240,214)', 'rgb(1,107,111)', 'rgb(234,211,239)', 'rgb(37,126,45)', 'rgb(171,71,185)', 'rgb(225,103,150)', 'rgb(86,89,241)', 'rgb(164,7,15)', 'rgb(24,254,5)',
        'rgb(55,115,96)', 'rgb(159,39,145)', 'rgb(30,171,133)', 'rgb(241,96,62)', 'rgb(35,145,75)', 'rgb(151,58,219)', 'rgb(46,224,222)', 'rgb(170,209,244)', 'rgb(198,60,239)', 'rgb(13,139,55)', 'rgb(37,75,167)', 'rgb(32,141,1)',
        'rgb(13,215,87)', 'rgb(36,102,134)', 'rgb(201,15,192)', 'rgb(180,153,165)', 'rgb(188,56,128)', 'rgb(183,205,145)', 'rgb(187,146,123)', 'rgb(21,211,54)', 'rgb(253,176,168)', 'rgb(87,243,109)', 'rgb(48,25,117)', 'rgb(113,147,49)',
        'rgb(163,162,123)', 'rgb(129,228,41)', 'rgb(182,156,133)', 'rgb(220,154,79)', 'rgb(133,33,190)', 'rgb(123,157,115)', 'rgb(220,37,152)', 'rgb(54,89,12)', 'rgb(54,152,118)', 'rgb(42,137,101)', 'rgb(148,126,108)', 'rgb(252,78,56)',
        'rgb(117,47,148)', 'rgb(66,227,215)', 'rgb(72,158,152)', 'rgb(38,151,197)', 'rgb(130,120,228)', 'rgb(102,182,162)', 'rgb(64,181,175)', 'rgb(135,6,72)', 'rgb(217,89,54)', 'rgb(196,56,77)', 'rgb(2,51,191)', 'rgb(182,2,33)',
        'rgb(101,215,243)', 'rgb(172,63,177)', 'rgb(86,224,11)', 'rgb(118,22,164)', 'rgb(164,233,58)', 'rgb(111,116,131)', 'rgb(68,49,168)', 'rgb(129,220,26)', 'rgb(177,94,150)', 'rgb(87,110,44)', 'rgb(141,26,198)', 'rgb(190,96,159)',
        'rgb(179,49,10)', 'rgb(233,150,181)', 'rgb(83,114,236)', 'rgb(108,220,76)', 'rgb(157,120,181)', 'rgb(237,248,73)', 'rgb(141,3,155)', 'rgb(89,218,128)', 'rgb(175,239,173)', 'rgb(4,127,36)', 'rgb(184,14,33)', 'rgb(119,108,96)',
        'rgb(251,220,189)', 'rgb(50,83,248)', 'rgb(161,173,28)', 'rgb(19,91,99)', 'rgb(139,80,239)', 'rgb(160,181,236)', 'rgb(104,219,159)', 'rgb(122,191,163)', 'rgb(218,125,13)', 'rgb(209,214,73)', 'rgb(179,15,241)', 'rgb(56,159,8)', 'rgb(70,168,109)', 'rgb(106,194,71)',
        'rgb(152,142,189)', 'rgb(159,161,93)', 'rgb(89,14,120)', 'rgb(244,86,127)', 'rgb(96,253,41)', 'rgb(231,163,57)', 'rgb(217,212,104)', 'rgb(93,96,178)', 'rgb(106,65,80)', 'rgb(52,92,4)', 'rgb(11,35,80)', 'rgb(212,129,178)',
        'rgb(52,26,9)', 'rgb(48,229,77)', 'rgb(140,7,200)', 'rgb(162,161,250)', 'rgb(198,76,58)', 'rgb(176,185,150)', 'rgb(159,79,22)', 'rgb(201,60,64)', 'rgb(250,88,160)', 'rgb(2,145,218)', 'rgb(198,55,234)', 'rgb(235,162,57)',
        'rgb(31,112,157)', 'rgb(33,185,143)', 'rgb(238,99,224)', 'rgb(28,41,16)', 'rgb(161,95,36)', 'rgb(54,201,83)', 'rgb(156,127,225)', 'rgb(65,160,176)', 'rgb(68,194,117)', 'rgb(177,74,21)', 'rgb(115,44,175)', 'rgb(131,79,195)',
        'rgb(215,188,62)', 'rgb(34,196,40)', 'rgb(11,112,93)', 'rgb(110,125,211)', 'rgb(145,174,3)', 'rgb(39,94,244)', 'rgb(239,219,254)', 'rgb(56,45,161)', 'rgb(19,120,76)', 'rgb(188,163,115)', 'rgb(151,171,193)', 'rgb(162,95,237)',
        'rgb(120,24,155)', 'rgb(127,236,228)', 'rgb(203,133,41)', 'rgb(61,140,109)', 'rgb(183,143,138)', 'rgb(108,165,235)', 'rgb(128,96,166)', 'rgb(32,218,36)', 'rgb(225,174,252)', 'rgb(100,98,120)', 'rgb(171,88,6)',
        'rgb(73,178,12)', 'rgb(157,164,71)', 'rgb(12,204,36)', 'rgb(77,166,252)', 'rgb(248,55,248)', 'rgb(182,49,208)', 'rgb(56,165,11)', 'rgb(14,30,182)', 'rgb(32,9,108)', 'rgb(201,161,134)', 'rgb(87,199,132)',
        'rgb(40,223,88)', 'rgb(134,129,247)', 'rgb(100,116,201)', 'rgb(242,105,171)', 'rgb(148,72,71)', 'rgb(133,241,10)', 'rgb(126,153,172)', 'rgb(130,230,178)', 'rgb(184,247,121)', 'rgb(162,21,47)', 'rgb(193,95,124)',
        'rgb(173,253,96)', 'rgb(37,246,83)', 'rgb(101,15,149)', 'rgb(83,94,31)', 'rgb(54,2,36)', 'rgb(30,194,125)', 'rgb(15,9,34)', 'rgb(205,236,190)', 'rgb(16,165,23)', 'rgb(116,91,162)', 'rgb(151,211,6)', 'rgb(12,111,179)',
        'rgb(4,111,196)', 'rgb(113,134,202)', 'rgb(47,131,2)', 'rgb(7,103,59)', 'rgb(127,245,178)', 'rgb(119,111,170)', 'rgb(85,218,15)', 'rgb(157,36,111)', 'rgb(185,204,65)', 'rgb(112,140,45)', 'rgb(177,105,190)',
        'rgb(66,146,117)', 'rgb(25,181,234)', 'rgb(64,237,14)', 'rgb(196,6,147)', 'rgb(18,157,1)', 'rgb(226,161,67)', 'rgb(162,213,58)', 'rgb(180,240,241)', 'rgb(181,152,33)', 'rgb(226,208,85)', 'rgb(83,35,243)',
        'rgb(108,31,189)', 'rgb(85,241,31)', 'rgb(165,155,132)', 'rgb(1,106,112)', 'rgb(162,170,232)', 'rgb(253,220,131)', 'rgb(87,109,183)', 'rgb(136,136,124)', 'rgb(202,37,67)', 'rgb(64,29,223)', 'rgb(242,141,11)',
        'rgb(191,39,155)', 'rgb(254,83,26)', 'rgb(253,245,179)', 'rgb(51,91,66)', 'rgb(194,127,188)', 'rgb(208,238,199)', 'rgb(73,79,82)', 'rgb(155,120,74)', 'rgb(63,198,63)', 'rgb(49,207,49)', 'rgb(170,183,24)',
        'rgb(126,122,30)', 'rgb(236,210,1)', 'rgb(196,4,202)', 'rgb(194,153,146)', 'rgb(99,6,221)', 'rgb(123,170,116)', 'rgb(223,79,67)', 'rgb(247,2,229)', 'rgb(24,235,173)', 'rgb(34,171,115)', 'rgb(168,194,209)',
        'rgb(31,98,125)', 'rgb(205,246,252)', 'rgb(18,244,73)', 'rgb(191,45,51)', 'rgb(211,156,148)', 'rgb(116,240,202)', 'rgb(9,244,115)', 'rgb(9,238,107)', 'rgb(102,117,114)', 'rgb(192,160,135)', 'rgb(57,189,244)',
        'rgb(52,235,26)', 'rgb(107,157,243)', 'rgb(177,50,70)', 'rgb(11,121,236)', 'rgb(43,99,170)', 'rgb(177,100,141)', 'rgb(95,228,224)', 'rgb(182,80,30)', 'rgb(191,127,172)', 'rgb(221,164,73)', 'rgb(246,254,229)',
        'rgb(47,216,60)', 'rgb(68,241,82)', 'rgb(189,75,79)', 'rgb(214,5,87)', 'rgb(231,193,50)', 'rgb(38,83,60)', 'rgb(70,67,41)', 'rgb(49,20,156)', 'rgb(142,7,153)', 'rgb(157,79,7)', 'rgb(241,245,124)', 'rgb(20,53,132)',
        'rgb(113,175,229)', 'rgb(235,139,14)', 'rgb(33,225,165)', 'rgb(249,203,243)', 'rgb(77,147,18)', 'rgb(117,217,72)', 'rgb(102,166,46)', 'rgb(70,65,179)', 'rgb(95,8,96)', 'rgb(164,71,102)', 'rgb(39,236,220)',
        'rgb(111,110,27)', 'rgb(178,80,243)', 'rgb(111,92,112)', 'rgb(10,242,128)', 'rgb(133,192,188)', 'rgb(17,238,23)', 'rgb(182,233,220)', 'rgb(14,197,111)', 'rgb(191,81,129)', 'rgb(63,173,31)', 'rgb(28,209,7)',
        'rgb(0,126,41)', 'rgb(241,56,50)', 'rgb(233,131,69)', 'rgb(211,59,205)', 'rgb(178,50,162)', 'rgb(85,199,186)', 'rgb(224,60,105)', 'rgb(173,235,38)', 'rgb(189,8,191)', 'rgb(33,86,151)', 'rgb(5,199,252)',
        'rgb(132,54,166)', 'rgb(59,151,232)', 'rgb(189,226,240)', 'rgb(104,123,247)', 'rgb(232,254,166)', 'rgb(25,150,33)', 'rgb(243,13,42)', 'rgb(93,213,105)', 'rgb(72,222,144)', 'rgb(156,19,199)',
        'rgb(32,91,156)', 'rgb(130,115,231)', 'rgb(181,241,147)', 'rgb(2,168,189)', 'rgb(143,157,37)', 'rgb(176,41,9)', 'rgb(232,252,202)', 'rgb(44,232,54)', 'rgb(61,187,131)', 'rgb(137,112,232)',
        'rgb(42,109,50)', 'rgb(156,71,40)', 'rgb(211,221,236)', 'rgb(142,75,249)', 'rgb(78,246,193)', 'rgb(97,78,70)', 'rgb(17,1,235)', 'rgb(29,173,116)', 'rgb(93,225,194)', 'rgb(255,229,36)', 'rgb(168,137,241)',
        'rgb(68,177,136)', 'rgb(240,221,60)', 'rgb(28,38,50)', 'rgb(205,120,121)', 'rgb(148,251,217)', 'rgb(53,100,72)', 'rgb(155,62,237)', 'rgb(11,80,191)', 'rgb(122,125,45)', 'rgb(139,59,172)', 'rgb(180,48,162)',
        'rgb(0,38,51)', 'rgb(228,160,98)', 'rgb(243,42,254)', 'rgb(139,174,93)', 'rgb(44,145,136)', 'rgb(78,126,194)', 'rgb(127,20,34)', 'rgb(149,242,164)', 'rgb(204,62,106)', 'rgb(177,146,1)', 'rgb(46,44,211)',
        'rgb(201,206,205)', 'rgb(3,22,208)', 'rgb(195,77,6)', 'rgb(178,5,161)', 'rgb(159,161,180)', 'rgb(115,134,194)', 'rgb(140,153,172)', 'rgb(154,132,235)', 'rgb(147,137,13)', 'rgb(111,112,179)',
        'rgb(224,91,230)', 'rgb(228,8,241)'
    ]
    //specify day number for today
var now = new Date();
var start = new Date(now.getFullYear(), 0, 0);
var diff = now - start;
var oneDay = 1000 * 60 * 60 * 24;
var day = Math.floor(diff / oneDay);
r = 0
g = 0
b = 0
oldSet = []


function initialise() {
    if (localStorage.getItem('colourMatchinstructionsSeen') == (false || null)) {
        showInstructions()
    }
    todayColor = colorList[day]
    $('#content').css('background', todayColor)
    updateComparison()

    //set array in local if none exists
    //set blank array if it doesnt exist
    if (localStorage.getItem("historicColourMatchScores") == null) {
        localStorage.setItem("historicColourMatchScores", '[]')
    }

    //check if user has played today
    dailyLockout('check')
}

function showInstructions() {
    $('#instructionsDiv').css('display', 'block')
}

function closeInstructions() {
    $('#instructionsDiv').css('display', 'none')
    localStorage.setItem('colourMatchinstructionsSeen', true)
}

function showStats() {

    $('#statsDiv').css('display', 'block')
    displayScores()
}

function closeStats() {
    $('#statsDiv').css('display', 'none')
}


function getDifference(a, b) {
    return Math.abs(a - b);
}

function submitClick(x) {

    if (x == 'loadState') {
        r = localStorage.getItem('redGuess')
        g = localStorage.getItem('greenGuess')
        b = localStorage.getItem('blueGuess')
    }
    answer = JSON.parse(todayColor.substring(3).replace('(', '[').replace(')', ']'))
    diffr = getDifference(answer[0], r)
    diffg = getDifference(answer[1], g)
    diffb = getDifference(answer[2], b)
    score = diffr + diffb + diffg
    sendEvent("colourMatch", "submit", score)
    emoji = ''
        //choose emoji based on score
    if (score == 0) {
        emoji = '&#x1F389;&#x1F947;&#x1F389;'
    }
    if (score > 0) {
        emoji = '&#x1F947;'
    }
    if (score > 10) {
        emoji = '&#x1F948;'
    }
    if (score > 50) {
        emoji = '&#x1F949;'
    }
    if (score > 100) {
        emoji = '&#x1F626;'
    }
    $('#guessRepresentation').html('<div style="display:flex; text-aligh:left; justify-content:space-around"><div class="answerValue">' +
        answer[0] + '</div><div class="answerValue">' + answer[1] + '</div><div class="answerValue">' + answer[2] + '</div></div>' +
        '<br><div class="answerValue overallAnswer">' + score + ' ' + emoji + '<br><small>Total Difference</small></div>' +
        '<button onclick="shareClick()" class="submitBtn"><i class="fa fa-share-alt" aria-hidden="true"></i></button>' + '</div>')

    //update the rgb guess value in local storage for state retrieval
    localStorage.setItem('redGuess', r)
    localStorage.setItem('greenGuess', g)
    localStorage.setItem('blueGuess', b)

    if (x != 'loadState') {
        updateScoresinLocalStorage(score)
        dailyLockout('lock')

    }
    displayScores()

}

function shareClick() {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.style.fontWeight = "normal"
    dummy.value = 'http://bludle.com/colourMatch#shared\nMy average score is ' + $('#averageScore').html() + '\n' +
        'and my latest score is ' + JSON.parse(localStorage.getItem('historicColourMatchScores'))[JSON.parse(localStorage.getItem('historicColourMatchScores')).length - 1]
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    document.execCommand("copy");
    snackbar('Your results have been copied to the clipboard')
}

function snackbar(x) {
    $('#snackbar').html(x)
        // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
}

function dailyLockout(x) {
    //when user hits submit
    if (x == 'lock' || localStorage.getItem('lastColourPlayDay') == day) {
        $('#comparisonBlock').prop('disabled', true)
        $('#submitBtn').prop('disabled', true)
        $('#guessValue1').prop('disabled', true)
        $('#guessValue2').prop('disabled', true)
        $('#guessValue3').prop('disabled', true)

        localStorage.setItem('lastColourPlayDay', day)
    }
    // check called on page load from initialise function
    if (x == 'check') {
        if (localStorage.getItem('lastColourPlayDay') == day) {
            $('#comparisonBlock').prop('disabled', true)
            $('#submitBtn').prop('disabled', true)
            $('#guessValue1').prop('disabled', true)
            $('#guessValue2').prop('disabled', true)
            $('#guessValue3').prop('disabled', true)
            loadState()
        }
    }
}

function loadState() {
    //get variables
    var redGuess = localStorage.getItem('redGuess')
    var greenGuess = localStorage.getItem('greenGuess')
    var blueGuess = localStorage.getItem('blueGuess')
    lastScore = localStorage.getItem('historicColourMatchScores')[localStorage.getItem('historicColourMatchScores').length - 1]

    //set to inputs
    $('#guessValue1').val(redGuess)
    $('#guessValue2').val(greenGuess)
    $('#guessValue3').val(blueGuess)
    $('#guessRepresentation').css("background", 'rgb(' + redGuess + ',' + greenGuess + ',' + blueGuess + ')')
    submitClick('loadState')

}

function updateScoresinLocalStorage(score) {
    oldSet = JSON.parse(localStorage.getItem("historicColourMatchScores"))
    oldSet.push(score)
    localStorage.setItem("historicColourMatchScores", JSON.stringify(oldSet))
}

function displayScores() {
    //set the initial state before appending scores html
    $('#historic').html('<div id="historic"></div>')
    $('#average').html('<div id="average"></div>')
    $('#total').html('<div id="total"></div>')
    $('#gamesPlayed').html('<div id="gamesPlayed"></div>')


    //calculate and set scores

    //all scores
    oldSet = JSON.parse(localStorage.getItem("historicColourMatchScores"))
    if (oldSet.length <= 40) {
        oldSet.forEach(i => {
            $('#historic').html($('#historic').html() + '<div class="individualHistoricScore">' + i + ' </div>')
        })
    } else {
        oldSet.forEach(i => {
            $('#historic').html($('#historic').html() + '<div class="individualHistoricScore smaller">' + i + ' </div>')
        })
    }





    //average score

    var sum = 0
    oldSet.forEach(i => {
        sum = sum + i
    })
    $('#average').html($('#average').html() + '<div id="averageScore" class="individualHistoricScore">' + (sum / oldSet.length).toFixed(2) + ' </div>')


    //total score
    $('#total').html($('#total').html() + '<div class="individualHistoricScore">' + sum + ' </div>')
    $('#gamesPlayed').html($('#gamesPlayed').html() + '<div class="individualHistoricScore">' + oldSet.length + ' </div>')
}


function updateComparison() {
    $('#guessRepresentation').html('')
    r = $('#guessValue1').val()
    g = $('#guessValue2').val()
    b = $('#guessValue3').val()
    if (r == ("" || null)) { r = 0 }
    if (g == ("" || null)) { g = 0 }
    if (b == ("" || null)) { b = 0 }
    $('#guessRepresentation').css("background", 'rgb(' + r + ',' + g + ',' + b + ')')
}



function valueUp(x) {
    if (localStorage.getItem('lastColourPlayDay') != day) {

        if (x.val() < 255) {
            x.val(parseInt(x.val()) + 1)
            updateComparison()
        }
    }
}

function valueDown(x) {
    if (localStorage.getItem('lastColourPlayDay') != day) {

        if (x.val() > 0) {
            x.val(parseInt(x.val()) - 1)
            updateComparison()
        }
    }
}

function sendEvent(category, action, label) {
    if ("ga" in window) {
        tracker = ga.getAll()[0];
        if (tracker)
            tracker.send("event", category, action, label);
    }

}