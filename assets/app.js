
const D=window.DASH_DATA;const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const tip=d3.select('#tip');function showTip(e,h){tip.html(h).style('opacity',1).style('left',(e.clientX+12)+'px').style('top',(e.clientY+12)+'px')}function hideTip(){tip.style('opacity',0)}
const fmt=d3.format(',.0f');
// ---------- rollout
const WN=['Market size','Affordability','Season length','Gap (unorganised/FD)','Low competition','Logistics adjacency'],W0=[.30,.15,.15,.15,.10,.15];
const wctl=d3.select('#wctl');WN.forEach((n,i)=>{const l=wctl.append('label');l.html(`${n} <output id="ow${i}">${W0[i].toFixed(2)}</output>`);l.append('input').attr('type','range').attr('min',0).attr('max',.5).attr('step',.01).attr('value',W0[i]).attr('id','w'+i).on('input',drawRoll)});
function drawRoll(){const w=WN.map((_,i)=>+document.getElementById('w'+i).value);WN.forEach((_,i)=>document.getElementById('ow'+i).textContent=w[i].toFixed(2));
 const sw=d3.sum(w)||1;const rows=D.states.map(s=>({...s,idx:100*d3.sum(s.f.map((f,i)=>f*w[i]))/sw})).sort((a,b)=>b.idx-a.idx);rows.forEach((r,i)=>{r.rank=i+1;r.wave=i<6?2:(i<12?3:4)});
 const W=540,rh=19,H=rows.length*rh+30,m={l:118,r:36,t:4,b:22};const x=d3.scaleLinear().domain([0,100]).range([m.l,W-m.r]);
 const svg=d3.select('#roll').html('').append('svg').attr('viewBox',`0 0 ${W} ${H}`);
 svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(5).tickSize(0)).select('.domain').remove();
 const col={2:css('--s1'),3:css('--s2'),4:css('--s3')};
 const g=svg.selectAll('g.r').data(rows).join('g').attr('class','r').attr('transform',(d,i)=>`translate(0,${m.t+i*rh})`);
 g.append('text').attr('x',m.l-6).attr('y',rh/2+4).attr('text-anchor','end').text(d=>d.state);
 g.append('rect').attr('x',x(0)).attr('y',3).attr('height',rh-6).attr('rx',3).attr('width',d=>x(d.idx)-x(0)).attr('fill',d=>col[d.wave]);
 g.append('text').attr('x',d=>x(d.idx)+4).attr('y',rh/2+4).text(d=>d.idx.toFixed(0));
 g.append('rect').attr('x',0).attr('y',0).attr('width',W).attr('height',rh).attr('fill','transparent').on('mousemove',(e,d)=>showTip(e,`<b>${d.state}</b> (${d.region})<br>Index ${d.idx.toFixed(1)}, rank ${d.rank}, Wave ${d.wave}<br>Top-6 in ${Math.round(d.p6*100)}% of 5,000 random weight draws (report)`)).on('mouseleave',hideTip);
 d3.select('#t3').text(rows.slice(0,6).map(r=>r.state).join(', '));
 const t=d3.select('#tbl').html('');t.append('tr').html('<th>State</th><th>Region</th><th>Index</th><th>Rank</th><th>Wave</th>');rows.forEach(r=>t.append('tr').html(`<td>${r.state}</td><td>${r.region}</td><td>${r.idx.toFixed(1)}</td><td>${r.rank}</td><td>${r.wave}</td>`));}
drawRoll();
// ---------- ladder (same logit as the report's Python model)
const AV=[{BC:.40,A:.75,K:.70,L:.50},{BC:.30,A:.65,K:.50,L:.75},{BC:.15,A:.45,K:.25,L:.90}];
const COMP={entry:{A:10,K:15,L:5},core:{A:25,K:30,L:15},premium:{A:50,K:60,L:null}},MIX={entry:.55,core:.35,premium:.10},COGS={entry:.66,core:.55,premium:.46},NR=(1-.2-.06)/1.18;
function shares(tier,pBC,mult,amulEntry){const out=[0,0,0,0,0];const pA=tier==='entry'?amulEntry:COMP[tier].A;
 for(const r of D.panel){const av=AV[r[0]];const bc=Math.min(.95,av.BC*mult);const u=[r[3]+r[1]*pBC+r[2]+Math.log(bc),r[4]+r[1]*pA+r[2]+Math.log(av.A),r[5]+r[1]*COMP[tier].K+r[2]*.6+Math.log(av.K)];
  u.push(COMP[tier].L==null?-1e9:r[6]+r[1]*COMP[tier].L+Math.log(av.L));u.push(.6);const mx=Math.max(...u);const e=u.map(v=>Math.exp(v-mx));const s=d3.sum(e);e.forEach((v,i)=>out[i]+=v/s)}
 return out.map(v=>v/D.panel.length)}
function drawLad(){const pe=+pe_.value,pc=+pc_.value,pp=+pp_.value,av=+av_.value,am=+am_.value;
 o_pe.textContent='Rs '+pe;o_pc.textContent='Rs '+pc;o_pp.textContent='Rs '+pp;o_av.textContent=(av>=1?'+':'')+Math.round((av-1)*100)+'%';o_am.textContent='Rs '+am;
 const P={entry:pe,core:pc,premium:pp};let sh=0,gp=0;const rows=[];
 for(const t of ['entry','core','premium']){const s=shares(t,P[t],av,am);rows.push({t,s});sh+=MIX[t]*s[0];gp+=MIX[t]*s[0]*P[t]*NR*(1-COGS[t])}
 d3.select('#sh').text((sh*100).toFixed(1)+'%');d3.select('#gp').text('Rs '+fmt(gp*1000));
 const W=540,H=150,m={l:70,r:10,t:6,b:20};const y=d3.scaleBand().domain(rows.map(r=>r.t)).range([m.t,H-m.b]).padding(.3);const x=d3.scaleLinear().domain([0,1]).range([m.l,W-m.r]);
 const svg=d3.select('#lad').html('').append('svg').attr('viewBox',`0 0 ${W} ${H}`);
 svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(5,'%').tickSize(0)).select('.domain').remove();
 const cols=[css('--s1'),css('--s2'),css('--s3'),css('--s4'),css('--rule')],names=['Bombay Creamery','Amul',"Kwality Wall's",'Local / frozen dessert','No purchase'];
 rows.forEach(r=>{let x0=0;svg.append('text').attr('x',m.l-6).attr('y',y(r.t)+y.bandwidth()/2+4).attr('text-anchor','end').text(r.t[0].toUpperCase()+r.t.slice(1)+' (Rs '+P[r.t]+')');
  r.s.forEach((v,i)=>{svg.append('rect').attr('x',x(x0)+1).attr('y',y(r.t)).attr('width',Math.max(0,x(x0+v)-x(x0)-2)).attr('height',y.bandwidth()).attr('rx',2).attr('fill',cols[i])
   .on('mousemove',e=>showTip(e,`<b>${names[i]}</b><br>${r.t} tier: ${(v*100).toFixed(1)}% of occasions`)).on('mouseleave',hideTip);x0+=v})})}
const pe_=document.getElementById('pe'),pc_=document.getElementById('pc'),pp_=document.getElementById('pp'),av_=document.getElementById('av'),am_=document.getElementById('am');
[pe_,pc_,pp_,av_,am_].forEach(el=>el.addEventListener('input',drawLad));drawLad();
// ---------- freezer
function drawFz(){const u=+uu.value,asp=+aa.value,fz=+ff.value,rm=+rr.value,cg=+cc.value;
 o_u.textContent=u;o_asp.textContent='Rs '+asp;o_fz.textContent='Rs '+fmt(fz);o_rm.textContent=Math.round(rm*100)+'%';o_cg.textContent=Math.round(cg*100)+'%';
 const nr=(1-rm-.06)/1.18,cpu=asp*nr*(1-cg-.08),mc=u*30*cpu-125,pb=mc>0?fz/mc:Infinity,be=(fz/12+125)/(30*cpu);
 d3.select('#pb').text(isFinite(pb)?pb.toFixed(0)+' months':'never');d3.select('#mc').text('Rs '+fmt(mc));d3.select('#be').text(be>0?be.toFixed(0):'n/a');d3.select('#t4').text(isFinite(pb)?pb.toFixed(0)+' months':'never');
 const types=[['Metro high-street',22],['Tier-1 kirana',14],['Tier-2 kirana',10],['Tier-3 / rural',6]].map(([n,uu])=>{const m=uu*30*cpu-125;return {n,uu,p:m>0?fz/m:99}});
 const W=540,H=132,m={l:110,r:40,t:16,b:20};const x=d3.scaleLinear().domain([0,72]).range([m.l,W-m.r]);const y=d3.scaleBand().domain(types.map(t=>t.n)).range([m.t,H-m.b]).padding(.3);
 const svg=d3.select('#pbbar').html('').append('svg').attr('viewBox',`0 0 ${W} ${H}`);
 svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(6).tickSize(0)).select('.domain').remove();
 svg.append('line').attr('x1',x(24)).attr('x2',x(24)).attr('y1',m.t).attr('y2',H-m.b).attr('stroke',css('--mute')).attr('stroke-dasharray','3 3');
 svg.append('text').attr('x',x(24)+4).attr('y',m.t-5).text('24-mo hurdle').style('font-size','10px');
 types.forEach(t=>{const c=t.p<=24?css('--s3'):(t.p<=36?css('--s4'):css('--s2'));svg.append('text').attr('x',m.l-6).attr('y',y(t.n)+y.bandwidth()/2+4).attr('text-anchor','end').text(t.n);
  svg.append('rect').attr('x',x(0)).attr('y',y(t.n)).attr('height',y.bandwidth()).attr('rx',3).attr('width',x(Math.min(t.p,72))-x(0)).attr('fill',c).on('mousemove',e=>showTip(e,`<b>${t.n}</b><br>${t.uu} units/day: payback ${t.p>=72?'72+':t.p.toFixed(0)} months`)).on('mouseleave',hideTip);
  svg.append('text').attr('x',x(Math.min(t.p,72))+4).attr('y',y(t.n)+y.bandwidth()/2+4).text(t.p>=72?'72+ mo':t.p.toFixed(0)+' mo')})}
const uu=document.getElementById('u'),aa=document.getElementById('asp'),ff=document.getElementById('fz'),rr=document.getElementById('rm'),cc=document.getElementById('cg');
[uu,aa,ff,rr,cc].forEach(el=>el.addEventListener('input',drawFz));drawFz();
// ---------- forecast
let SC='Base';function drawFc(){const rows=D.fc[SC].map(r=>({...r,d:d3.timeParse('%Y-%m')(r.month)}));const keys=['w1','w2','w3','w4'];
 const st=d3.stack().keys(keys)(rows);const W=540,H=220,m={l:44,r:10,t:8,b:22};const x=d3.scaleTime().domain(d3.extent(rows,r=>r.d)).range([m.l,W-m.r]);
 const y=d3.scaleLinear().domain([0,180]).range([H-m.b,m.t]);const svg=d3.select('#fc').html('').append('svg').attr('viewBox',`0 0 ${W} ${H}`);
 svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %y")).tickSize(0)).select('.domain').remove();
 svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(W-m.l-m.r))).call(g=>g.select('.domain').remove()).call(g=>g.selectAll('line').attr('stroke',css('--rule')));
 svg.append('text').attr('x',m.l).attr('y',m.t+2).text('Rs crore / month').style('font-size','10px');
 const cols=[css('--w1'),css('--s1'),css('--s2'),css('--s3')];
 svg.selectAll('path.a').data(st).join('path').attr('d',d3.area().x(d=>x(d.data.d)).y0(d=>y(d[0])).y1(d=>y(d[1]))).attr('fill',(d,i)=>cols[i]).attr('stroke',css('--card')).attr('stroke-width',1);
 const ln=svg.append('line').attr('y1',m.t).attr('y2',H-m.b).attr('stroke',css('--mute')).style('opacity',0);
 svg.append('rect').attr('x',m.l).attr('y',m.t).attr('width',W-m.l-m.r).attr('height',H-m.t-m.b).attr('fill','transparent')
  .on('mousemove',e=>{const [mx]=d3.pointer(e);const dt=x.invert(mx);const i=d3.bisector(r=>r.d).center(rows,dt);const r=rows[i];ln.attr('x1',x(r.d)).attr('x2',x(r.d)).style('opacity',1);
   showTip(e,`<b>${d3.timeFormat('%b %Y')(r.d)}</b> (${SC})<br>Wave 1: Rs ${r.w1.toFixed(1)} cr<br>Wave 2: Rs ${r.w2.toFixed(1)} cr<br>Wave 3: Rs ${r.w3.toFixed(1)} cr<br>Wave 4: Rs ${r.w4.toFixed(1)} cr<br><b>Total: Rs ${(r.w1+r.w2+r.w3+r.w4).toFixed(1)} cr</b>`)})
  .on('mouseleave',()=>{ln.style('opacity',0);hideTip()});
 const f=D.fy[SC];d3.select('#fytxt').text(`${SC} case net revenue: FY27 Rs ${f.FY27.toFixed(0)} cr, FY28 Rs ${f.FY28.toFixed(0)} cr, FY29 Rs ${f.FY29.toFixed(0)} cr (net of trade margins and GST).`);}
d3.selectAll('#scen button').on('click',function(){SC=this.dataset.s;d3.selectAll('#scen button').classed('on',false);d3.select(this).classed('on',true);drawFc()});drawFc();
d3.select('#t1').text('Rs '+fmt(D.fy.Base.FY29)+' cr');d3.select('#t1d').text(`Bear Rs ${fmt(D.fy.Bear.FY29)} cr | Bull Rs ${fmt(D.fy.Bull.FY29)} cr`);d3.select('#t2').text((D.share.FY29*100).toFixed(1)+'%');
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{drawRoll();drawLad();drawFz();drawFc()});
