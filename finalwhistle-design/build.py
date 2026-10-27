from pathlib import Path
P=Path(__file__).parent
s=(P/'base.js').read_text()
a=s.index("    const title = el('header', null, 'fw-title');");b=s.index('    const archive=',a)
s=s[:a]+'''    const morning=coffee.title || 'Le partite di Coffee Time';
    const cupMorning=morning==='Il caffè della coppa: otto squadre, quattro posti';
    const allPlayed=completed===matches.length;
    const headline=cupMorning ? (allPlayed?'La notte della coppa: otto squadre, quattro semifinaliste':'La notte della coppa: quattro posti da conquistare') : morning.replace(/^Il caffè/i,'La serata')+(completed?' · Il verdetto del campo':' · In attesa del fischio d’inizio');
    const title=el('header',null,'fw-title');title.append(el('p',coffee.label || coffee.date+' · GW001','eyebrow'),el('h2',headline),el('p',allPlayed ? `${matches.length} partite giocate · Le voci dei protagonisti` : completed ? `${completed} partite concluse · La serata continua` : `${matches.length} partite · Le voci dai campi`));root.append(title);
'''+s[b:]
a=s.index("    const update = el('div', null, 'fw-update')");b=s.index('    if (errors)',a);s=s[:a]+s[b:]
a=s.index('    root.append(speech(...cast[0], reports ?');b=s.index('    const nav =',a)
s=s[:a]+'''    const welcome=cupMorning && allPlayed ? 'Buonasera e benvenuti a Final Whistle. Si sono giocati i quattro quarti di finale di coppa. Questa mattina erano otto squadre per quattro posti: ora la serata ha dato i suoi verdetti. Andiamo dai protagonisti.' : allPlayed ? `Buonasera e benvenuti a Final Whistle. Si sono giocate le ${matches.length} partite presentate questa mattina a Coffee Time. Ripercorriamo la serata con le voci dei protagonisti.` : completed ? `Buonasera e benvenuti a Final Whistle. Si sono concluse ${completed} delle ${matches.length} partite di questa serata. Cominciamo dai campi che hanno già dato il loro verdetto.` : 'Benvenuti a Final Whistle. Ci ritroveremo al termine delle partite presentate questa mattina a Coffee Time, per ascoltare i protagonisti e raccontare la serata.';
    root.append(speech(...cast[0],welcome));
'''+s[b:]
s=s.replace("m.report ? 'Risultato e Match Report disponibili' : m.row ? 'Risultato disponibile · Match Report in attesa' : 'In attesa del Match Report · Ore '", "m.report ? 'Fischio finale · Il dopopartita' : m.row ? 'Fischio finale · In attesa dei protagonisti' : 'Calcio d’inizio · Ore '")
s=s.replace('    choose(Math.min(selected,coffee.divisions.length-1));','    choose(Math.min(selected,coffee.divisions.length-1));\n    window.finalWhistleDesign?.(root,state);')
(P/'final-whistle.js').write_text(s)
html=(P/'base.html').read_text().replace('final-whistle.js?v=20261027-editorial','final-whistle.js?v=20261027-design')
html=html.replace('</head>','<link rel="stylesheet" href="final-whistle-design.css?v=20261027"></head>')
html=html.replace('<script defer src="final-whistle.js', '<script defer src="final-whistle-design.js?v=20261027"></script><script defer src="final-whistle.js')
(P/'index.html').write_text(html)
