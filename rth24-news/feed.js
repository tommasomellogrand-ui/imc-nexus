(()=>{'use strict';
let panel=document.getElementById('rth-panel-ultimora');if(!panel)return;
let active='ultimora';const tabs=[...document.querySelectorAll('.rth-tabs [role=tab]')];
const category=item=>item.category||'flash';
function select(tab){active=tab.id.replace('rth-tab-','');for(const t of tabs){const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!on}panel=document.getElementById(tab.getAttribute('aria-controls'));panel.replaceChildren(list);filter()}
function filter(){let count=0;for(const entry of list.querySelectorAll('.rth-news-entry')){entry.hidden=active!=='ultimora'&&entry.dataset.category!==({'flash-news':'flash',club:'club',mercato:'market'}[active]);if(!entry.hidden)count++}let empty=list.querySelector('.rth-news-empty');if(!empty){empty=el('p','Nessuna notizia in questa categoria.','rth-news-empty');list.append(empty)}empty.hidden=count>0}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t));t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[n]);tabs[n].focus()})});
const list=document.createElement('div');list.className='rth-news-list';list.setAttribute('aria-live','polite');panel.replaceChildren(list);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n};
const picture=(file,alt,cls)=>{if(!/^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)$/.test(file))return null;const img=el('img',null,cls);img.src='/nexus/alltoplayfor/rth-24/'+file;img.alt=alt;return img};
async function load(){try{
const response=await fetch('/nexus/alltoplayfor/rth-24/flash-news.json',{cache:'no-store'});if(!response.ok)throw Error();
const data=await response.json();if(data.version!==1||!Array.isArray(data.items))throw Error();list.replaceChildren();
for(const item of [...data.items].sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)||b.id.localeCompare(a.id))){
 const entry=el('div',null,'rth-news-entry');entry.dataset.category=category(item);
 const card=el('article',null,'rth-news-card');card.id='news-'+item.id;card.dataset.newsId=item.id;
 const header=el('div',null,'rth-news-header'),body=el('div',null,'rth-news-body');
 if(item.image){const img=picture(item.image.file,item.image.alt,'rth-news-photo');if(img){card.classList.add('has-photo');const media=el('div',null,'rth-news-media');media.append(img);header.append(media)}}
 const time=el('time',new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(new Date(item.published_at)));time.dateTime=item.published_at;
 if(item.teams?.length){const teams=el('div',null,'rth-news-teams');for(const team of item.teams){const badge=el('span',null,'rth-news-team'),logo=picture(team.logo,'Stemma '+team.name,'rth-news-logo');if(logo)badge.append(logo);badge.append(el('span',team.name));teams.append(badge)}body.append(teams)}
 body.append(el('h3',item.title));header.append(body);
 const content=el('div',null,'rth-news-content');
 if(item.coverage?.length){
  const intro=item.text.split('\n\n').slice(0,2);content.append(el('p',intro[0],'rth-news-disclosure'),el('p',intro[1],'rth-news-intro'));
  for(const c of item.coverage){
   const section=el('section',null,'rth-news-connection');section.append(el('h4','Dal club · '+c.club));
   for(const [name,role,text,photo] of [[c.reporter,'In collegamento · '+c.club,c.question,c.reporter_image],[c.manager,'Manager · '+c.club,c.answer,c.manager_image]]){
    const turn=el('div',null,'rth-news-turn');const speaker=el('div',null,'rth-news-speaker');if(photo){const avatar=picture(photo.file,name,'rth-news-avatar');if(avatar)speaker.append(avatar)}const label=el('div',null,'rth-news-speaker-label');label.append(el('strong',name),el('span',role));speaker.append(label);turn.append(speaker,el('p','«'+text+'»'));section.append(turn);
   }content.append(section);
  }
 }else{content.append(el('p',item.text))}
 const ribbon=el('div',null,'rth-news-ribbon'),icon=el('span',item.category==='market'?'↔':item.category==='club'?'◉':'ϟ','rth-news-icon');icon.setAttribute('aria-hidden','true');
 ribbon.append(icon,el('span',item.category==='club'?'CLUB NEWS':item.category==='market'?'CALCIOMERCATO':'FLASH NEWS'),time);card.append(ribbon,header);
 if(item.transfer){
  const summary=el('div',null,'rth-news-transfer');const route=el('div',null,'rth-news-route');for(const side of ['from','to']){if(side==='to')route.append(el('span','→','rth-news-route-arrow'));const club=el('div',null,'rth-news-route-club');const logo=picture(item.transfer[side+'_logo'],'Stemma '+item.transfer[side],'rth-news-route-logo');if(logo)club.append(logo);club.append(el('span',item.transfer[side]));route.append(club)}summary.append(route);
  const facts=el('dl',null,'rth-news-facts');for(const [label,value] of [['Formula',item.transfer.formula],['Operazione',item.transfer.amount],['Conclusa il',new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(item.transfer.date+'T12:00:00Z'))]]){const fact=el('div');fact.append(el('dt',label),el('dd',value));facts.append(fact)}summary.append(facts);card.append(summary);
 }
 card.append(content);entry.append(card);list.append(entry);
}
filter();for(const p of document.querySelectorAll('.rth-panel')){p.dataset.feedState='ready';p.dataset.feedRevision=data.revision||'';}
}catch(e){list.replaceChildren(el('p','Flash News temporaneamente non disponibili. Riprova.'));const retry=el('button','Riprova');retry.type='button';retry.addEventListener('click',load);list.append(retry);panel.dataset.feedState='error'}}load();})();
