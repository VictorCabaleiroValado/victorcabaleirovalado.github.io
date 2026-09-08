'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(n);
const money=n=>'$'+num(n),pct=n=>Number.isFinite(n)?(100*n).toFixed(1)+'%':'—';
let rows=[],meta,view='overview',page=0,search='';
const fields={month:'Month',country:'Country',type:'TransactionType',issue:'PrimaryIssue'};
const sum=(a,k)=>a.reduce((n,r)=>n+(+r[k]||0),0);
function filtered(){return rows.filter(r=>Object.entries(fields).every(([id,k])=>!$('#'+id).value||r[k]===$('#'+id).value));}
function group(a,k){const m=new Map();a.forEach(r=>{if(!m.has(r[k]))m.set(r[k],[]);m.get(r[k]).push(r)});return [...m].map(([name,data])=>({name,data}));}
function panel(t,sub,body){return '<section class="panel"><h2>'+t+'</h2><p class="sub">'+sub+'</p>'+body+'</section>'}
function card(t,v,sub='Distinct invoice identifiers'){return '<div class="card"><span>'+t+'</span><strong>'+v+'</strong><small>'+sub+'</small></div>'}
function bars(items,fmt=num){let max=Math.max(1,...items.map(x=>x.value));return items.map(x=>'<div class="barrow"><span>'+esc(x.name)+'</span><div class="track"><div class="fill" style="width:'+Math.max(0,x.value/max*100)+'%"></div></div><b>'+fmt(x.value)+'</b></div>').join('')}
function trend(a,calc,fmt=pct){const all=group(a,'Month').sort((x,y)=>x.name.localeCompare(y.name)).map(g=>({name:g.name,value:calc(g.data)}));const max=Math.max(.01,...all.map(x=>x.value));return '<div class="trend" role="img" aria-label="'+esc(all.map(x=>x.name+': '+fmt(x.value)).join('; '))+'">'+all.map(x=>'<div class="period"><span class="number">'+fmt(x.value)+'</span><div class="column" style="height:'+x.value/max*130+'px"></div><span class="axis">'+x.name.slice(2)+'</span></div>').join('')+'</div>'}
function dataTable(head,data){return '<div class="tablewrap"><table><thead><tr>'+head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+data.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
const note=t=>'<div class="note">'+t+'</div>';
function render(){
 const a=filtered(),n=sum(a,'SourceRows'),f=sum(a,'FlaggedRows'),pv=sum(a,'PositiveValue'),fv=sum(a,'FlaggedPositiveValue');
 $('nav').querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===view));
 $('#scope').textContent=num(n)+' source lines · '+num(new Set(a.map(r=>r.Invoice)).size)+' distinct invoices · '+num(a.length)+' invoice/issue groups. All amounts in USD at historical monthly exchange rates.'+($('#month').value==='2011-12'?' December 2011 is partial.':'');
 const params=new URLSearchParams({view});Object.keys(fields).forEach(k=>{if($('#'+k).value)params.set(k,$('#'+k).value)});history.replaceState(null,'','?'+params);
 if(!n&&view!=='methodology'){$('#content').innerHTML='<div class="panel empty"><h2>No records match these filters.</h2><p>Reset filters to return to the full historical snapshot.</p></div>';return}
 let h='';
 if(view==='overview'){
 h='<div class="kpis">'+card('Source lines',num(n),'Original records retained')+card('Review incidence',pct(f/n),num(f)+' lines trigger at least one rule')+card('Distinct invoices',num(new Set(a.map(r=>r.Invoice)).size)) +card('Flagged positive value',money(fv),'Associated value, not lost revenue')+'</div>';
 h+='<div class="grid">'+panel('How does review incidence change?','Monthly share of source lines triggering any configured rule.',trend(a,d=>sum(d,'FlaggedRows')/sum(d,'SourceRows')))+panel('What needs investigation?','Primary-issue groups are mutually exclusive; counts reconcile.',bars(group(a,'PrimaryIssue').filter(g=>g.name!=='No rule triggered').map(g=>({name:g.name,value:sum(g.data,'SourceRows')})).sort((x,y)=>y.value-x.value)))+'</div>';
 h+=note('Missing customer IDs limit customer analysis, but do not invalidate every sale. C-prefix cancellations are valid transaction context. December 2011 covers only the first nine days.');
 }else if(view==='quality'){
 h='<div class="kpis">'+card('Customer coverage',pct(1-sum(a,'MissingCustomerRows')/n),'Populated IDs / source lines')+card('Description coverage',pct(1-sum(a,'MissingDescriptionRows')/n),'Populated descriptions / source lines')+card('Duplicate candidates',num(sum(a,'DuplicateRows')),'Excess exact repetitions, retained')+card('Rule triggers',num(sum(a,'RuleHits')),'Overlapping checks; not unique rows')+'</div>';
 const rs=[['Customer ID missing','MissingCustomerRows'],['Description missing','MissingDescriptionRows'],['Exact duplicate candidate','DuplicateRows'],['Zero unit price','ZeroPriceRows'],['Negative unit price','NegativePriceRows'],['Non-C negative quantity','AdjustmentRows']];
 h+='<div class="grid">'+panel('Customer identification over time','Populated customer IDs as a share of source lines.',trend(a,d=>1-sum(d,'MissingCustomerRows')/sum(d,'SourceRows')))+panel('Rule-level findings','A line can appear under several rules. Do not sum these as unique affected lines.',bars(rs.map(([name,k])=>({name,value:sum(a,k)}))))+'</div>';
 h+=panel('What to do with each signal','Review actions grounded in the data contract.',dataTable(['Rule','Interpretation','Recommended action'],meta.rules.map(r=>[r.label,r.interpretation,r.action])));
 }else if(view==='value'){
 const dup=sum(a,'DuplicatePositiveValue');
 h='<div class="kpis">'+card('Positive line value',money(pv),'Positive units × price, outside cancellations')+card('Flagged value share',pct(fv/pv),'Union of flags; counted once per row')+card('Duplicate-associated value',money(dup),'A sensitivity scenario, not confirmed overstatement')+card('Unidentified-customer value',money(sum(a,'UnidentifiedPositiveValue')),'May overlap with duplicate-associated value')+'</div>';
 h+='<div class="grid">'+panel('Value associated with flagged records','Monthly positive value on source lines with at least one rule.',trend(a,d=>sum(d,'FlaggedPositiveValue'),x=>'$'+num(x/1000)+'k'))+panel('Duplicate-candidate sensitivity','No source records are removed in this project.',bars([{name:'Original positive value',value:pv},{name:'Without candidates',value:pv-dup}],money)+note('Difference: <strong>'+money(dup)+'</strong>. This is an analytical scenario. Confirm against original invoices before any deletion.'))+'</div>';
 h+=panel('Transaction context','Signed line values include cancellations and adjustments; they are not audited revenue.',dataTable(['Class','Source lines','Signed line value'],group(a,'TransactionType').map(g=>[g.name,num(sum(g.data,'SourceRows')),money(sum(g.data,'SignedValue'))])));
 }else if(view==='records'){
 h=panel('Investigation workspace','One row per invoice/date/country/class/issue pattern. Export includes the full filtered selection.', '<div class="toolbar"><input id="search" aria-label="Find invoice" placeholder="Find an invoice…" value="'+esc(search)+'"><select id="sort" aria-label="Sort investigation"><option value="value">Flagged value: high to low</option><option value="date">Date: newest first</option><option value="rows">Source lines: high to low</option></select></div><div id="records"></div>');
 }else{
 h='<div class="method">'+panel('01 / Evidence','Actual source data; reproducible derivations.','<p>Daqing Chen, UCI Online Retail, DOI 10.24432/C5BW33. 541,909 source lines and 25,900 invoice identifiers. CC BY 4.0. Historical coverage: 1 December 2010–9 December 2011. The final month is partial.</p>')+panel('02 / SQL architecture','From immutable source to an analysis-ready model.','<p>Raw rows → date, country, invoice and product dimensions → transaction fact → issue bridge → reporting marts. ROW_NUMBER, CTEs, LAG and DENSE_RANK support duplicate detection, trends and prioritization. Thirteen automated checks validate the model.</p>')+panel('03 / Counts and money','Prevent hidden fanout and overlapping totals.','<p>Review Lines counts each source row once. Rule Triggers can be higher because rules overlap. Invoice counts are distinct. Positive value uses positive quantities and prices outside cancellations. SQL preserves original values in integer thousandths of GBP. Displayed USD values use the transaction month’s Federal Reserve EXUSUK average USD/GBP rate, then aggregate. This is an analytical translation, not a settlement rate. December 2011 uses its full-month rate on the first nine days of records.</p>')+panel('04 / Interpretation','A flag is a reason to investigate.','<p>Customer IDs may be absent without invalidating the financial record. Duplicate candidates are not confirmed duplicates: no source line ID exists. Negative-price records are labelled Adjust bad debt. No flag means no configured rule triggered, not verified correctness.</p>')+panel('05 / Metadata conflict','The workbook controls the analysis.','<p>UCI metadata says no missing values. The downloaded workbook has 135,080 missing CustomerID values and 1,454 missing descriptions. The file hash and profile are preserved. No root causes or remediation outcomes are invented.</p>')+panel('06 / Native Power BI','The primary BI deliverable.','<p>The native report uses the same validated SQL extract and explicit DAX measures. It includes six pages, navigation, slicers, cross-filtering, a market scatterplot and record investigation. The published Power BI view and this companion explorer are public and require no account.</p>')+'</div>';
 }
 $('#content').innerHTML=h;
 if(view==='records'){$('#search').oninput=e=>{search=e.target.value;page=0;renderRecords()};$('#sort').onchange=()=>{page=0;renderRecords()};renderRecords()}
}
function renderRecords(){
 let a=filtered().filter(r=>r.Invoice.toLowerCase().includes(search.toLowerCase()));
 const sort=$('#sort').value;a.sort((x,y)=>sort==='date'?y.Date.localeCompare(x.Date):sort==='rows'?y.SourceRows-x.SourceRows:y.FlaggedPositiveValue-x.FlaggedPositiveValue);
 const max=Math.max(0,Math.ceil(a.length/20)-1);page=Math.min(page,max);
 $('#records').innerHTML=dataTable(['Invoice','Date','Country','Primary issue','Lines','Rule triggers','Flagged value'],a.slice(page*20,page*20+20).map(r=>[r.Invoice,r.Date,r.Country,r.PrimaryIssue,num(r.SourceRows),num(r.RuleHits),money(r.FlaggedPositiveValue)]))+'<div class="pager"><button id="prev" '+(!page?'disabled':'')+'>← Previous</button><span>Page '+(page+1)+' of '+(max+1)+' · '+num(a.length)+' groups</span><button id="next" '+(page===max?'disabled':'')+'>Next →</button></div>';
 $('#prev').onclick=()=>{page--;renderRecords()};$('#next').onclick=()=>{page++;renderRecords()};
}
function exportCSV(){
 const a=filtered().filter(r=>view!=='records'||r.Invoice.toLowerCase().includes(search.toLowerCase()));
 const columns=meta.columns;const quote=x=>'"'+String(x).replace(/"/g,'""')+'"';const text=columns.map(quote).join(',')+'\n'+a.map(r=>columns.map(k=>quote(r[k])).join(',')).join('\n');
 const u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=u;link.download='data-quality-filtered-invoice-groups.csv';link.click();URL.revokeObjectURL(u);
}
fetch('data.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json()}).then(data=>{
 meta=data;rows=data.rows.map(r=>Object.fromEntries(data.columns.map((c,i)=>[c,r[i]])));
 const params=new URLSearchParams(location.search);
 Object.entries(fields).forEach(([id,k])=>{[...new Set(rows.map(r=>r[k]))].sort().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;$('#'+id).appendChild(o)});if(params.get(id))$('#'+id).value=params.get(id);$('#'+id).onchange=()=>{page=0;render()}});
 if(['overview','quality','value','records','methodology'].includes(params.get('view')))view=params.get('view');
 $('nav').querySelectorAll('button').forEach(b=>b.onclick=()=>{view=b.dataset.view;page=0;render()});
 $('#reset').onclick=()=>{Object.keys(fields).forEach(id=>$('#'+id).value='');search='';page=0;render()};
 $('#export').onclick=exportCSV;render();
}).catch(()=>{$('#scope').textContent='The validated data could not be loaded. Please reload the page.'});
