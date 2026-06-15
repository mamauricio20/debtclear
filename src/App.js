/* eslint-disable */
import { useState, useMemo } from "react";

const C = {
  bg:"#0B0F1A", surface:"#131929", surfaceAlt:"#1A2238", border:"#1E2D4A",
  mint:"#00E5A0", mintDim:"#00B87C", mintGlow:"rgba(0,229,160,0.10)",
  red:"#FF5C7A", redDim:"#C0344F", redGlow:"rgba(255,92,122,0.10)",
  amber:"#F5A623", blue:"#4A90E2", purple:"#9B7FFF",
  textPrimary:"#F0F4FF", textSecondary:"#7A8FAD", textMuted:"#3D506E",
};

const fmt = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(+n||0);
const fmtP = (n) => `${(+n||0).toFixed(1)}%`;
const fmtDate = (d) => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const payoffDate = (months) => {
  const d = new Date(2026,5,14);
  d.setMonth(d.getMonth()+Math.round(months));
  return d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
};

const FREQ = [
  {value:"weekly",label:"Weekly",mult:52/12},
  {value:"biweekly",label:"Bi-Weekly",mult:26/12},
  {value:"semimo",label:"Semi-Monthly",mult:2},
  {value:"monthly",label:"Monthly",mult:1},
  {value:"yearly",label:"Yearly",mult:1/12},
];
const toMonthly = (amt,freq) => (+amt||0) * (FREQ.find(f=>f.value===freq)?.mult||1);

const CATS=["Groceries","Dining","Gas","Shopping","Subscriptions","Travel","Healthcare","Entertainment","Other"];
const BILL_CATS=["Housing","Utilities","Insurance","Subscriptions","Transport","Health","Education","Other"];
const INC_TYPES=["salary","hourly","freelance","rental","investment","benefits","other"];

const INIT_INCOME=[
  {id:1,label:"Primary Job",amount:5200,freq:"monthly",type:"salary"},
  {id:2,label:"Side Gig",amount:400,freq:"monthly",type:"other"},
];
const INIT_BILLS=[
  {id:1,label:"Rent",amount:1350,cat:"Housing"},
  {id:2,label:"Car Insurance",amount:142,cat:"Insurance"},
  {id:3,label:"Phone",amount:85,cat:"Utilities"},
  {id:4,label:"Internet",amount:60,cat:"Utilities"},
  {id:5,label:"Gym",amount:40,cat:"Health"},
];
const INIT_CARDS=[
  {id:1,name:"Chase Sapphire",limit:10000,balance:3840,apr:22.99,dueDay:15,closeDay:7,color:"#4A90E2"},
  {id:2,name:"Citi Double Cash",limit:7500,balance:1220,apr:19.99,dueDay:22,closeDay:14,color:"#00E5A0"},
  {id:3,name:"Discover It",limit:5000,balance:950,apr:17.24,dueDay:8,closeDay:28,color:"#F5A623"},
];
const INIT_EXPENSES=[
  {id:1,date:"2026-06-10",desc:"Whole Foods",amount:94.32,cardId:1,cat:"Groceries"},
  {id:2,date:"2026-06-09",desc:"Shell Gas",amount:62.18,cardId:2,cat:"Gas"},
  {id:3,date:"2026-06-08",desc:"Netflix",amount:15.99,cardId:1,cat:"Subscriptions"},
  {id:4,date:"2026-06-07",desc:"Chipotle",amount:13.47,cardId:3,cat:"Dining"},
  {id:5,date:"2026-06-05",desc:"Amazon",amount:78.00,cardId:2,cat:"Shopping"},
  {id:6,date:"2026-06-03",desc:"Spotify",amount:9.99,cardId:1,cat:"Subscriptions"},
];
const INIT_PAYMENTS=[
  {id:1,date:"2026-06-01",amount:200,cardId:1,note:"Min payment"},
  {id:2,date:"2026-05-22",amount:150,cardId:2,note:"Min payment"},
  {id:3,date:"2026-05-08",amount:100,cardId:3,note:"Min payment"},
];

function simulate(cards,extra=0){
  let bals=cards.map(c=>({...c,balance:+c.balance}));
  let months=0,interest=0;
  while(bals.some(b=>b.balance>0.01)&&months<600){
    months++;
    let left=extra;
    bals=bals.map(b=>{
      if(b.balance<=0)return b;
      const i=(b.balance*b.apr)/100/12;interest+=i;b.balance+=i;
      b.balance-=Math.min(b.balance,Math.max(b.balance*0.02,25));
      return b;
    });
    [...bals].sort((a,b2)=>b2.apr-a.apr).forEach(card=>{
      const t=bals.find(b=>b.id===card.id);
      if(t&&t.balance>0&&left>0){const p=Math.min(t.balance,left);t.balance-=p;left-=p;}
    });
  }
  return{months,interest:Math.round(interest),date:payoffDate(months)};
}

function Pill({color=C.mint,children}){
  return <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,background:color+"22",color,fontSize:11,fontWeight:600}}>{children}</span>;
}
function Bar({pct,color=C.mint,h=8}){
  return(
    <div style={{background:C.bg,borderRadius:6,height:h,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(+pct||0,100)}%`,background:color,borderRadius:6,transition:"width 0.5s"}}/>
    </div>
  );
}
function StatBox({label,value,sub,color}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <div style={{fontSize:11,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:21,fontWeight:700,color:color||C.textPrimary,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:C.textMuted}}>{sub}</div>}
    </div>
  );
}
function SCard({children,style}){
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,...style}}>{children}</div>;
}
function SHead({title,action}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontWeight:700,fontSize:15}}>{title}</div>
      {action}
    </div>
  );
}
function InfoBox({icon,title,color=C.mint,children}){
  return(
    <div style={{padding:14,background:color+"15",border:`1px solid ${color}44`,borderRadius:12,marginBottom:12}}>
      <div style={{fontWeight:700,fontSize:13,color,marginBottom:5}}>{icon} {title}</div>
      <div style={{fontSize:13,color:C.textSecondary,lineHeight:1.6}}>{children}</div>
    </div>
  );
}
function Btn({variant="primary",children,style,...p}){
  const vs={
    primary:{background:C.mint,color:"#000"},
    ghost:{background:C.surfaceAlt,color:C.textPrimary,border:`1px solid ${C.border}`},
    danger:{background:C.redDim,color:"#fff"},
  };
  return <button style={{padding:"9px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",...vs[variant],...style}} {...p}>{children}</button>;
}
function FInput({label,...p}){
  return(
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:12,color:C.textSecondary,marginBottom:5}}>{label}</label>
      <input {...p} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.textPrimary,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",...(p.style||{})}}/>
    </div>
  );
}
function FSelect({label,options,...p}){
  return(
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:12,color:C.textSecondary,marginBottom:5}}>{label}</label>
      <select {...p} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.textPrimary,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
function Modal({title,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:26,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:16}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textSecondary,cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Dashboard({cards,expenses,payments,incomes,totalDebt,totalLimit,overallUtil,monthlyIncome,yearlyIncome,debtToIncome,totalMinPay,monthExpenses,discretionary,minS,recS,aggroS,recExtra,getCardName,setDetailCard,setTab}){
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${C.surface},${C.surfaceAlt})`,border:`1px solid ${C.border}`,borderRadius:16,padding:24,marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:18}}>
          <div>
            <div style={{fontSize:11,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Total Debt</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:42,fontWeight:700,lineHeight:1}}>{fmt(totalDebt)}</div>
            <div style={{fontSize:13,color:C.textSecondary,marginTop:5}}>{cards.length} accounts · {fmtP(overallUtil)} utilized</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Monthly Income</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:28,fontWeight:700,color:C.mint}}>{fmt(monthlyIncome)}</div>
            <div style={{fontSize:13,color:C.textSecondary,marginTop:5}}>{fmt(yearlyIncome)}/yr · {fmtP(debtToIncome)} DTI</div>
          </div>
        </div>
        <Bar pct={overallUtil} color={overallUtil>75?C.red:overallUtil>30?C.amber:C.mint}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textMuted,marginTop:4}}><span>0%</span><span>30% target</span><span>100%</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:12,marginBottom:18}}>
        {[
          {label:"Available Credit",value:fmt(totalLimit-totalDebt),color:C.mint},
          {label:"Min Payments/mo",value:fmt(totalMinPay)},
          {label:"Spent This Month",value:fmt(monthExpenses),color:C.amber},
          {label:"Free Cash/mo",value:fmt(discretionary),color:discretionary<0?C.red:C.mint},
        ].map(s=>(<SCard key={s.label} style={{padding:16}}><StatBox {...s}/></SCard>))}
      </div>
      <SCard style={{marginBottom:18}}>
        <SHead title="Payoff Date Forecast"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:12}}>
          {[
            {label:"Minimum Payments",s:minS,color:C.red},
            {label:`+${fmt(recExtra)}/mo Recommended`,s:recS,color:C.amber},
            {label:"Aggressive (80% surplus)",s:aggroS,color:C.mint},
          ].map(({label,s,color})=>(
            <div key={label} style={{background:C.bg,borderRadius:12,padding:16,borderLeft:`3px solid ${color}`}}>
              <div style={{fontSize:11,color:C.textSecondary,marginBottom:8}}>{label}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:22,color}}>{s.months}mo</div>
              <div style={{fontSize:14,fontWeight:600,color:C.textPrimary,marginTop:2}}>{s.date}</div>
              <div style={{fontSize:12,color:C.red,marginTop:3}}>{fmt(s.interest)} interest</div>
            </div>
          ))}
        </div>
      </SCard>
      <SCard style={{marginBottom:18}}>
        <SHead title="Cards at a Glance" action={<Btn variant="ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setTab("cards")}>View All</Btn>}/>
        {cards.map(card=>{
          const util=(+card.balance/+card.limit)*100;
          return(
            <div key={card.id} onClick={()=>setDetailCard(card)} style={{cursor:"pointer",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:card.color}}/>
                  <span style={{fontWeight:500,fontSize:14}}>{card.name}</span>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:14}}>{fmt(card.balance)}</span>
                  <Pill color={util>30?C.amber:C.mint}>{fmtP(util)}</Pill>
                </div>
              </div>
              <Bar pct={util} color={util>75?C.red:util>30?C.amber:card.color} h={5}/>
            </div>
          );
        })}
      </SCard>
      <SCard>
        <SHead title="Recent Activity"/>
        {[...expenses.slice(0,4).map(e=>({...e,_t:"exp"})),...payments.slice(0,3).map(p=>({...p,_t:"pay"}))]
          .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7).map(item=>(
          <div key={item.id+item._t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}55`}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:item._t==="pay"?C.mintGlow:C.redGlow}}>
                {item._t==="pay"?"↓":"↑"}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>{item._t==="pay"?"Payment":item.desc}</div>
                <div style={{fontSize:12,color:C.textSecondary}}>{fmtDate(item.date)} · {getCardName(item.cardId)}</div>
              </div>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:14,color:item._t==="pay"?C.mint:C.red}}>
              {item._t==="pay"?"-":"+"}{fmt(item.amount)}
            </div>
          </div>
        ))}
      </SCard>
    </div>
  );
}

function IncomePage({incomes,bills,monthlyIncome,yearlyIncome,monthlyBills,totalMinPay,monthExpenses,discretionary,debtToIncome,overallUtil,cards,minS,recS,recExtra,setModal,deleteIncome,deleteBill}){
  return(
    <div>
      <SCard style={{marginBottom:18}}>
        <SHead title="Income Sources" action={<Btn style={{fontSize:12,padding:"7px 14px"}} onClick={()=>setModal("income")}>+ Add Income</Btn>}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
          <StatBox label="Monthly Take-Home" value={fmt(monthlyIncome)} color={C.mint}/>
          <StatBox label="Annual Income" value={`$${(yearlyIncome/1000).toFixed(1)}k`} color={C.mint}/>
          <StatBox label="Sources" value={incomes.length}/>
        </div>
        {incomes.map(inc=>{
          const mo=toMonthly(inc.amount,inc.freq);
          const fq=FREQ.find(f=>f.value===inc.freq);
          return(
            <div key={inc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}66`}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:36,height:36,borderRadius:10,background:C.mintGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💰</div>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{inc.label}</div>
                  <div style={{fontSize:12,color:C.textSecondary}}>{fq?.label} · {inc.type}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:C.mint}}>{fmt(mo)}/mo</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{fmt(inc.amount)}/{inc.freq==="yearly"?"yr":inc.freq==="biweekly"?"2wk":inc.freq==="semimo"?"2x/mo":inc.freq}</div>
                </div>
                <button onClick={()=>deleteIncome(inc.id)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16}}>🗑</button>
              </div>
            </div>
          );
        })}
      </SCard>
      <SCard style={{marginBottom:18}}>
        <SHead title="Monthly Budget Breakdown" action={<Btn variant="ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={()=>setModal("bill")}>+ Add Bill</Btn>}/>
        {[
          {icon:"💰",label:"Income",value:monthlyIncome,color:C.mint},
          {icon:"🏠",label:"Fixed Bills",value:-monthlyBills,color:C.blue},
          {icon:"💳",label:"Min Debt Payments",value:-totalMinPay,color:C.amber},
          {icon:"🛒",label:"Variable Expenses",value:-monthExpenses,color:C.red},
          {icon:discretionary<0?"🚨":"✅",label:"Free Cash",value:discretionary,color:discretionary<0?C.red:C.mint,bold:true},
        ].map(row=>(
          <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${C.border}55`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{row.icon}</span>
              <span style={{fontSize:14,fontWeight:row.bold?700:400,color:row.bold?C.textPrimary:C.textSecondary}}>{row.label}</span>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:15,color:row.color}}>
              {row.value<0&&row.label!=="Income"?"-":""}{fmt(Math.abs(row.value))}
            </span>
          </div>
        ))}
        {monthlyIncome>0&&(
          <div style={{marginTop:16}}>
            <div style={{display:"flex",height:14,borderRadius:8,overflow:"hidden",gap:2}}>
              {[monthlyBills/monthlyIncome,totalMinPay/monthlyIncome,monthExpenses/monthlyIncome,Math.max(0,discretionary)/monthlyIncome]
                .map((v,i)=>(<div key={i} style={{width:`${Math.min(v*100,100)}%`,background:[C.blue,C.amber,C.red,C.mint][i],minWidth:v>0.005?3:0}}/>))}
            </div>
            <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
              {[["Bills",C.blue],["Debt Pmts",C.amber],["Expenses",C.red],["Free",C.mint]].map(([l,c])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSecondary}}>
                  <div style={{width:10,height:10,borderRadius:2,background:c}}/>{l}
                </div>
              ))}
            </div>
          </div>
        )}
      </SCard>
      <SCard style={{marginBottom:18}}>
        <SHead title="Fixed Bills & Subscriptions"/>
        {bills.map(b=>(
          <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}55`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Pill color={C.blue}>{b.cat}</Pill>
              <span style={{fontSize:14,fontWeight:500}}>{b.label}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{fmt(b.amount)}/mo</span>
              <button onClick={()=>deleteBill(b.id)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16}}>🗑</button>
            </div>
          </div>
        ))}
      </SCard>
      <SCard>
        <SHead title="💡 Smart Money Strategies"/>
        {debtToIncome>43&&<InfoBox icon="🚨" title="High Debt-to-Income Ratio" color={C.red}>Your DTI is {fmtP(debtToIncome)} — above the 43% lender threshold. Focus on reducing balances before applying for new credit.</InfoBox>}
        {overallUtil>30&&<InfoBox icon="⚠️" title="Credit Utilization Above 30%" color={C.amber}>At {fmtP(overallUtil)} utilization your score may be suppressed. Getting below 30% can improve your score in 30–60 days.</InfoBox>}
        {discretionary>200&&<InfoBox icon="✅" title={`Put Your ${fmt(discretionary)}/mo Surplus to Work`} color={C.mint}>Applying {fmt(recExtra)}/mo extra cuts payoff from {minS.months} months to {recS.months} months and saves {fmt(minS.interest-recS.interest)} in interest.</InfoBox>}
        {discretionary<0&&<InfoBox icon="🚨" title="Spending Exceeds Income" color={C.red}>You are spending more than you earn. Review bills and expenses to create breathing room.</InfoBox>}
        {cards.length>0&&<InfoBox icon="🎯" title="Avalanche Order" color={C.purple}>{cards.slice().sort((a,b)=>b.apr-a.apr).map((c,i)=>`${i+1}. ${c.name} (${fmtP(c.apr)})`).join(" → ")}</InfoBox>}
        <InfoBox icon="📊" title="50/30/20 Budget Check" color={C.blue}>Needs (50%): {fmt(monthlyIncome*0.5)} · Wants (30%): {fmt(monthlyIncome*0.3)} · Savings+Debt (20%): {fmt(monthlyIncome*0.2)}</InfoBox>
        <InfoBox icon="📞" title="Negotiate Lower APR" color={C.amber}>Call your card issuers and request a rate reduction — even 2–3% less saves real money each month.</InfoBox>
      </SCard>
    </div>
  );
}

function CardsPage({cards,setDetailCard,setModal,deleteCard}){
  return(
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <Btn onClick={()=>setModal("card")}>+ Add Card</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:16}}>
        {cards.map(card=>{
          const util=(+card.balance/+card.limit)*100;
          const minPay=Math.max(+card.balance*0.02,25);
          const now=new Date(2026,5,14);
          const due=new Date(now.getFullYear(),now.getMonth(),card.dueDay);if(due<now)due.setMonth(due.getMonth()+1);
          let bal=+card.balance,mo=0,int=0;
          while(bal>0.01&&mo<600){mo++;const i=(bal*+card.apr)/100/12;int+=i;bal+=i;bal-=Math.min(bal,Math.max(bal*0.02,25));}
          return(
            <SCard key={card.id} style={{borderTop:`3px solid ${card.color}`,cursor:"pointer"}} onClick={()=>setDetailCard(card)}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:15}}>{card.name}</div>
                <button onClick={e=>{e.stopPropagation();deleteCard(card.id);}} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:15}}>🗑</button>
              </div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,marginBottom:2}}>{fmt(card.balance)}</div>
              <div style={{fontSize:12,color:C.textSecondary,marginBottom:12}}>of {fmt(card.limit)} limit</div>
              <Bar pct={util} color={util>75?C.red:util>30?C.amber:card.color} h={6}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
                {[
                  {l:"APR",v:fmtP(card.apr)},
                  {l:"Utilization",v:fmtP(util),c:util>30?C.amber:C.mint},
                  {l:"Min Payment",v:fmt(minPay)},
                  {l:"Due Date",v:due.toLocaleDateString("en-US",{month:"short",day:"numeric"})},
                  {l:"Payoff (min)",v:`${mo}mo`,c:C.textSecondary},
                  {l:"Est. Interest",v:fmt(Math.round(int)),c:C.red},
                ].map(s=>(<div key={s.l}><div style={{fontSize:11,color:C.textSecondary}}>{s.l}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:13,color:s.c||C.textPrimary}}>{s.v}</div></div>))}
              </div>
              <Btn variant="ghost" style={{width:"100%",marginTop:14,fontSize:12}} onClick={e=>{e.stopPropagation();setDetailCard(card);}}>Full Details</Btn>
            </SCard>
          );
        })}
      </div>
    </div>
  );
}

function ExpensesPage({expenses,cards,setModal}){
  const total=expenses.reduce((s,e)=>s+(+e.amount),0);
  const getCard=(id)=>cards.find(c=>c.id===+id);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <StatBox label="Total Logged" value={fmt(total)}/>
        <Btn onClick={()=>setModal("expense")}>+ Add Expense</Btn>
      </div>
      <SCard style={{overflow:"hidden",padding:0}}>
        <div style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 130px 95px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.06em"}}>
          <span>Date</span><span>Description</span><span>Amount</span><span>Card</span><span>Category</span>
        </div>
        {expenses.map(e=>{
          const card=getCard(e.cardId);
          return(
            <div key={e.id} style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 130px 95px",padding:"13px 16px",borderBottom:`1px solid ${C.border}44`,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.textSecondary}}>{fmtDate(e.date)}</span>
              <span style={{fontWeight:500,fontSize:14}}>{e.desc}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:C.red,fontSize:13}}>{fmt(e.amount)}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>{card&&<div style={{width:8,height:8,borderRadius:"50%",background:card.color}}/>}<span style={{fontSize:13}}>{card?.name||"?"}</span></div>
              <Pill color={C.blue}>{e.cat}</Pill>
            </div>
          );
        })}
      </SCard>
    </div>
  );
}

function PaymentsPage({payments,cards,setModal}){
  const total=payments.reduce((s,p)=>s+(+p.amount),0);
  const getCard=(id)=>cards.find(c=>c.id===+id);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <StatBox label="Total Paid" value={fmt(total)} color={C.mint}/>
        <Btn onClick={()=>setModal("payment")}>+ Add Payment</Btn>
      </div>
      <SCard style={{overflow:"hidden",padding:0}}>
        <div style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 1fr",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.06em"}}>
          <span>Date</span><span>Card</span><span>Amount</span><span>Note</span>
        </div>
        {payments.map(p=>{
          const card=getCard(p.cardId);
          return(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 1fr",padding:"13px 16px",borderBottom:`1px solid ${C.border}44`,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.textSecondary}}>{fmtDate(p.date)}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>{card&&<div style={{width:8,height:8,borderRadius:"50%",background:card.color}}/>}<span style={{fontWeight:500,fontSize:14}}>{card?.name||"?"}</span></div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:C.mint,fontSize:13}}>{fmt(p.amount)}</span>
              <span style={{fontSize:13,color:C.textSecondary}}>{p.note}</span>
            </div>
          );
        })}
      </SCard>
    </div>
  );
}

function PayoffPage({cards,minS,discretionary}){
  const [extra,setExtra]=useState(Math.max(0,Math.round(discretionary*0.5/25)*25));
  const custom=useMemo(()=>simulate(cards,extra),[cards,extra]);
  const totalDebt=cards.reduce((s,c)=>s+(+c.balance),0);
  const saved=minS.months-custom.months;
  const savedInt=minS.interest-custom.interest;
  return(
    <div>
      <SCard style={{marginBottom:18}}>
        <SHead title="Debt Payoff Calculator"/>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:12,color:C.textSecondary,marginBottom:8}}>Extra Monthly Payment</label>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <input type="range" min={0} max={Math.max(2000,Math.ceil(discretionary/25)*25)} step={25} value={extra} onChange={e=>setExtra(+e.target.value)} style={{flex:1,accentColor:C.mint}}/>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:22,color:C.mint,minWidth:100}}>{fmt(extra)}</div>
          </div>
        </div>
        <div style={{marginBottom:18}}>
          {[{label:"Minimum only",months:minS.months,date:minS.date,color:C.red},{label:`+${fmt(extra)}/mo`,months:custom.months,date:custom.date,color:C.mint}].map(s=>(
            <div key={s.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecondary,marginBottom:4}}>
                <span>{s.label}</span><span style={{color:s.color,fontWeight:600}}>{s.months}mo · {s.date}</span>
              </div>
              <div style={{background:C.bg,borderRadius:6,height:22,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${s.label==="Minimum only"?100:Math.max(8,(s.months/minS.months)*100)}%`,background:s.color+"cc",borderRadius:6,transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>
        {saved>0&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{background:C.mintGlow,border:`1px solid ${C.mintDim}44`,borderRadius:12,padding:14}}>
              <div style={{fontSize:11,color:C.textSecondary,marginBottom:4}}>Months Saved</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:26,color:C.mint}}>{saved}</div>
            </div>
            <div style={{background:C.mintGlow,border:`1px solid ${C.mintDim}44`,borderRadius:12,padding:14}}>
              <div style={{fontSize:11,color:C.textSecondary,marginBottom:4}}>Interest Saved</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:26,color:C.mint}}>{fmt(savedInt)}</div>
            </div>
          </div>
        )}
      </SCard>
      <SCard style={{marginBottom:18}}>
        <SHead title="Per Card Payoff"/>
        {cards.slice().sort((a,b)=>+b.apr-+a.apr).map((card,i)=>{
          let bal=+card.balance,mo=0,int=0;
          while(bal>0.01&&mo<600){mo++;const interest=(bal*+card.apr)/100/12;int+=interest;bal+=interest;bal-=Math.min(bal,Math.max(bal*0.02,25));}
          return(
            <div key={card.id} style={{borderBottom:`1px solid ${C.border}55`,padding:"14px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:card.color+"33",border:`1.5px solid ${card.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:card.color}}>{i+1}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{card.name}</div>
                    <div style={{fontSize:12,color:C.textSecondary}}>{fmt(card.balance)} · {fmtP(card.apr)} APR</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:16}}>{mo} months</div>
                  <div style={{fontWeight:600,color:C.textPrimary,fontSize:14}}>{payoffDate(mo)}</div>
                  <div style={{fontSize:12,color:C.red}}>{fmt(Math.round(int))} interest</div>
                </div>
              </div>
              <Bar pct={totalDebt>0?(+card.balance/totalDebt)*100:0} color={card.color} h={4}/>
            </div>
          );
        })}
      </SCard>
      <SCard>
        <SHead title="Payoff Strategies"/>
        <InfoBox icon="🔥" title="Avalanche — Saves Most Money" color={C.red}>{cards.slice().sort((a,b)=>+b.apr-+a.apr).map((c,i)=>`${i+1}. ${c.name} (${fmtP(c.apr)})`).join(" → ")}. Pay minimums everywhere, attack the first card hardest.</InfoBox>
        <InfoBox icon="⚡" title="Snowball — Builds Momentum" color={C.mint}>{cards.slice().sort((a,b)=>+a.balance-+b.balance).map((c,i)=>`${i+1}. ${c.name} (${fmt(c.balance)})`).join(" → ")}. Quick wins keep you motivated.</InfoBox>
        <InfoBox icon="💳" title="Balance Transfer" color={C.blue}>A 0% intro APR card lets you pause interest for 12–21 months. Move your highest-rate balance and pay it down aggressively.</InfoBox>
        <InfoBox icon="📞" title="Negotiate Your APR" color={C.amber}>Call issuers and ask for a lower rate — especially with on-time payment history.</InfoBox>
      </SCard>
    </div>
  );
}

function CardDetailModal({card,onClose}){
  const util=(+card.balance/+card.limit)*100;
  const minPay=Math.max(+card.balance*0.02,25);
  const moInt=(+card.balance*+card.apr)/100/12;
  const now=new Date(2026,5,14);
  const due=new Date(now.getFullYear(),now.getMonth(),card.dueDay);if(due<now)due.setMonth(due.getMonth()+1);
  const cl=new Date(now.getFullYear(),now.getMonth(),card.closeDay);if(cl<now)cl.setMonth(cl.getMonth()+1);
  let bal=+card.balance,mo=0,int=0;
  while(bal>0.01&&mo<600){mo++;const i=(bal*+card.apr)/100/12;int+=i;bal+=i;bal-=Math.min(bal,Math.max(bal*0.02,25));}
  return(
    <Modal title={card.name} onClose={onClose}>
      <div style={{height:3,background:card.color,margin:"0 -26px 18px"}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
        <StatBox label="Balance" value={fmt(card.balance)}/>
        <StatBox label="Limit" value={fmt(card.limit)}/>
        <StatBox label="APR" value={fmtP(card.apr)}/>
        <StatBox label="Min Payment" value={fmt(minPay)}/>
        <StatBox label="Monthly Interest" value={fmt(moInt)} color={C.red}/>
        <StatBox label="Utilization" value={fmtP(util)} color={util>30?C.amber:C.mint}/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:C.textSecondary,marginBottom:8}}>Credit Utilization</div>
        <Bar pct={util} color={util>75?C.red:util>30?C.amber:card.color}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textMuted,marginTop:4}}><span>0%</span><span>30% ideal</span><span>100%</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:C.bg,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:C.textSecondary,marginBottom:4}}>Payment Due</div>
          <div style={{fontWeight:700,fontSize:15}}>{due.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
        </div>
        <div style={{background:C.bg,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:C.textSecondary,marginBottom:4}}>Statement Closes</div>
          <div style={{fontWeight:700,fontSize:15}}>{cl.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
        </div>
      </div>
      <div style={{background:C.bg,borderRadius:12,padding:16}}>
        <div style={{fontSize:12,color:C.textSecondary,marginBottom:10}}>Payoff at Minimum Payments</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:20}}>{mo} months</div>
            <div style={{fontSize:13,color:C.textSecondary,marginTop:2}}>{payoffDate(mo)}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:20,color:C.red}}>{fmt(Math.round(int))}</div>
            <div style={{fontSize:13,color:C.textSecondary,marginTop:2}}>total interest</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [cards,setCards]=useState(INIT_CARDS);
  const [expenses,setExpenses]=useState(INIT_EXPENSES);
  const [payments,setPayments]=useState(INIT_PAYMENTS);
  const [incomes,setIncomes]=useState(INIT_INCOME);
  const [bills,setBills]=useState(INIT_BILLS);
  const [modal,setModal]=useState(null);
  const [detailCard,setDetailCard]=useState(null);

  const TODAY="2026-06-14";
  const [expF,setExpF]=useState({date:TODAY,desc:"",amount:"",cardId:1,cat:"Other"});
  const [payF,setPayF]=useState({date:TODAY,amount:"",cardId:1,note:""});
  const [cardF,setCardF]=useState({name:"",limit:"",balance:"",apr:"",dueDay:"15",closeDay:"7",color:"#4A90E2"});
  const [incF,setIncF]=useState({label:"",amount:"",freq:"monthly",type:"salary"});
  const [billF,setBillF]=useState({label:"",amount:"",cat:"Housing"});

  const monthlyIncome=useMemo(()=>incomes.reduce((s,i)=>s+toMonthly(i.amount,i.freq),0),[incomes]);
  const yearlyIncome=monthlyIncome*12;
  const monthlyBills=useMemo(()=>bills.reduce((s,b)=>s+(+b.amount),0),[bills]);
  const totalDebt=useMemo(()=>cards.reduce((s,c)=>s+(+c.balance),0),[cards]);
  const totalLimit=useMemo(()=>cards.reduce((s,c)=>s+(+c.limit),0),[cards]);
  const overallUtil=totalLimit>0?(totalDebt/totalLimit)*100:0;
  const totalMinPay=useMemo(()=>cards.reduce((s,c)=>s+Math.max(+c.balance*0.02,25),0),[cards]);
  const monthExpenses=useMemo(()=>expenses.filter(e=>e.date.startsWith("2026-06")).reduce((s,e)=>s+(+e.amount),0),[expenses]);
  const discretionary=monthlyIncome-monthlyBills-totalMinPay-monthExpenses;
  const debtToIncome=monthlyIncome>0?(totalMinPay/monthlyIncome)*100:0;
  const recExtra=Math.max(0,Math.min(discretionary*0.5,1500));
  const minS=useMemo(()=>simulate(cards,0),[cards]);
  const recS=useMemo(()=>simulate(cards,recExtra),[cards,recExtra]);
  const aggS=useMemo(()=>simulate(cards,Math.max(0,discretionary*0.8)),[cards,discretionary]);

  const getCardName=(id)=>cards.find(c=>c.id===+id)?.name||"Unknown";

  const addExpense=()=>{
    if(!expF.desc||!expF.amount)return;
    const e={...expF,id:Date.now(),amount:+expF.amount,cardId:+expF.cardId};
    setExpenses([e,...expenses]);
    setCards(cards.map(c=>c.id===e.cardId?{...c,balance:+c.balance+e.amount}:c));
    setModal(null);
  };
  const addPayment=()=>{
    if(!payF.amount)return;
    const p={...payF,id:Date.now(),amount:+payF.amount,cardId:+payF.cardId};
    setPayments([p,...payments]);
    setCards(cards.map(c=>c.id===p.cardId?{...c,balance:Math.max(0,+c.balance-p.amount)}:c));
    setModal(null);
  };
  const addCard=()=>{
    if(!cardF.name||!cardF.limit)return;
    setCards([...cards,{id:Date.now(),name:cardF.name,limit:+cardF.limit,balance:+cardF.balance||0,apr:+cardF.apr||0,dueDay:+cardF.dueDay||15,closeDay:+cardF.closeDay||7,color:cardF.color}]);
    setModal(null);
  };
  const addIncome=()=>{
    if(!incF.label||!incF.amount)return;
    setIncomes([...incomes,{id:Date.now(),...incF,amount:+incF.amount}]);
    setModal(null);setIncF({label:"",amount:"",freq:"monthly",type:"salary"});
  };
  const addBill=()=>{
    if(!billF.label||!billF.amount)return;
    setBills([...bills,{id:Date.now(),...billF,amount:+billF.amount}]);
    setModal(null);setBillF({label:"",amount:"",cat:"Housing"});
  };
  const deleteCard=(id)=>{setCards(cards.filter(c=>c.id!==id));setExpenses(expenses.filter(e=>e.cardId!==id));setPayments(payments.filter(p=>p.cardId!==id));};

  const TABS=[
    {id:"dashboard",label:"Dashboard"},
    {id:"income",label:"Income & Budget"},
    {id:"cards",label:"Cards"},
    {id:"expenses",label:"Expenses"},
    {id:"payments",label:"Payments"},
    {id:"payoff",label:"Payoff Plan"},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.textPrimary,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;}input::placeholder{color:#3D506E;}select option{background:#131929;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#1E2D4A;border-radius:4px;}
      `}</style>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"13px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.bg,zIndex:50}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,letterSpacing:"-0.02em"}}>DebtClear</div>
          <div style={{fontSize:11,color:C.textSecondary}}>Personal Finance & Debt Tracker</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" style={{padding:"7px 12px",fontSize:12}} onClick={()=>setModal("expense")}>+ Expense</Btn>
          <Btn style={{padding:"7px 12px",fontSize:12}} onClick={()=>setModal("payment")}>+ Payment</Btn>
        </div>
      </div>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"13px 14px",fontSize:13,fontWeight:500,color:tab===t.id?C.mint:C.textSecondary,borderBottom:`2px solid ${tab===t.id?C.mint:"transparent"}`,transition:"color 0.15s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:"20px",maxWidth:920,margin:"0 auto"}}>
        {tab==="dashboard"&&<Dashboard cards={cards} expenses={expenses} payments={payments} incomes={incomes} totalDebt={totalDebt} totalLimit={totalLimit} overallUtil={overallUtil} monthlyIncome={monthlyIncome} yearlyIncome={yearlyIncome} debtToIncome={debtToIncome} totalMinPay={totalMinPay} monthExpenses={monthExpenses} discretionary={discretionary} minS={minS} recS={recS} aggroS={aggS} recExtra={recExtra} getCardName={getCardName} setDetailCard={setDetailCard} setTab={setTab}/>}
        {tab==="income"&&<IncomePage incomes={incomes} bills={bills} monthlyIncome={monthlyIncome} yearlyIncome={yearlyIncome} monthlyBills={monthlyBills} totalMinPay={totalMinPay} monthExpenses={monthExpenses} discretionary={discretionary} debtToIncome={debtToIncome} overallUtil={overallUtil} cards={cards} minS={minS} recS={recS} recExtra={recExtra} setModal={setModal} deleteIncome={(id)=>setIncomes(incomes.filter(i=>i.id!==id))} deleteBill={(id)=>setBills(bills.filter(b=>b.id!==id))}/>}
        {tab==="cards"&&<CardsPage cards={cards} setDetailCard={setDetailCard} setModal={setModal} deleteCard={deleteCard}/>}
        {tab==="expenses"&&<ExpensesPage expenses={expenses} cards={cards} setModal={setModal}/>}
        {tab==="payments"&&<PaymentsPage payments={payments} cards={cards} setModal={setModal}/>}
        {tab==="payoff"&&<PayoffPage cards={cards} minS={minS} discretionary={discretionary}/>}
      </div>
      {modal==="income"&&(
        <Modal title="Add Income Source" onClose={()=>setModal(null)}>
          <FInput label="Label" value={incF.label} onChange={e=>setIncF({...incF,label:e.target.value})} placeholder="e.g. Day Job"/>
          <FInput label="Amount ($)" type="number" value={incF.amount} onChange={e=>setIncF({...incF,amount:e.target.value})} placeholder="0.00"/>
          <FSelect label="Frequency" value={incF.freq} onChange={e=>setIncF({...incF,freq:e.target.value})} options={FREQ.map(f=>({v:f.value,l:f.label}))}/>
          <FSelect label="Type" value={incF.type} onChange={e=>setIncF({...incF,type:e.target.value})} options={INC_TYPES.map(t=>({v:t,l:t.charAt(0).toUpperCase()+t.slice(1)}))}/>
          {incF.amount&&<div style={{background:C.mintGlow,border:`1px solid ${C.mintDim}44`,borderRadius:10,padding:12,marginBottom:14}}>
            <div style={{fontSize:12,color:C.textSecondary}}>Monthly equivalent</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:20,color:C.mint}}>{fmt(toMonthly(+incF.amount,incF.freq))}/mo</div>
          </div>}
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn style={{flex:1}} onClick={addIncome}>Add Income</Btn>
          </div>
        </Modal>
      )}
      {modal==="bill"&&(
        <Modal title="Add Fixed Bill" onClose={()=>setModal(null)}>
          <FInput label="Bill Name" value={billF.label} onChange={e=>setBillF({...billF,label:e.target.value})} placeholder="e.g. Rent"/>
          <FInput label="Monthly Amount ($)" type="number" value={billF.amount} onChange={e=>setBillF({...billF,amount:e.target.value})} placeholder="0.00"/>
          <FSelect label="Category" value={billF.cat} onChange={e=>setBillF({...billF,cat:e.target.value})} options={BILL_CATS.map(c=>({v:c,l:c}))}/>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn style={{flex:1}} onClick={addBill}>Add Bill</Btn>
          </div>
        </Modal>
      )}
      {modal==="expense"&&(
        <Modal title="Add Expense" onClose={()=>setModal(null)}>
          <FInput label="Date" type="date" value={expF.date} onChange={e=>setExpF({...expF,date:e.target.value})}/>
          <FInput label="Description" value={expF.desc} onChange={e=>setExpF({...expF,desc:e.target.value})} placeholder="e.g. Whole Foods"/>
          <FInput label="Amount ($)" type="number" value={expF.amount} onChange={e=>setExpF({...expF,amount:e.target.value})} placeholder="0.00"/>
          <FSelect label="Card" value={expF.cardId} onChange={e=>setExpF({...expF,cardId:e.target.value})} options={cards.map(c=>({v:c.id,l:c.name}))}/>
          <FSelect label="Category" value={expF.cat} onChange={e=>setExpF({...expF,cat:e.target.value})} options={CATS.map(c=>({v:c,l:c}))}/>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn style={{flex:1}} onClick={addExpense}>Add Expense</Btn>
          </div>
        </Modal>
      )}
      {modal==="payment"&&(
        <Modal title="Record Payment" onClose={()=>setModal(null)}>
          <FInput label="Date" type="date" value={payF.date} onChange={e=>setPayF({...payF,date:e.target.value})}/>
          <FInput label="Amount ($)" type="number" value={payF.amount} onChange={e=>setPayF({...payF,amount:e.target.value})} placeholder="0.00"/>
          <FSelect label="Card" value={payF.cardId} onChange={e=>setPayF({...payF,cardId:e.target.value})} options={cards.map(c=>({v:c.id,l:c.name}))}/>
          <FInput label="Note (optional)" value={payF.note} onChange={e=>setPayF({...payF,note:e.target.value})} placeholder="e.g. Min payment"/>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn style={{flex:1}} onClick={addPayment}>Record Payment</Btn>
          </div>
        </Modal>
      )}
      {modal==="card"&&(
        <Modal title="Add Credit Card" onClose={()=>setModal(null)}>
          <FInput label="Card Name" value={cardF.name} onChange={e=>setCardF({...cardF,name:e.target.value})} placeholder="e.g. Chase Sapphire"/>
          <FInput label="Credit Limit ($)" type="number" value={cardF.limit} onChange={e=>setCardF({...cardF,limit:e.target.value})} placeholder="5000"/>
          <FInput label="Current Balance ($)" type="number" value={cardF.balance} onChange={e=>setCardF({...cardF,balance:e.target.value})} placeholder="0.00"/>
          <FInput label="APR (%)" type="number" value={cardF.apr} onChange={e=>setCardF({...cardF,apr:e.target.value})} placeholder="22.99"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FInput label="Payment Due Day" type="number" value={cardF.dueDay} onChange={e=>setCardF({...cardF,dueDay:e.target.value})} placeholder="15"/>
            <FInput label="Statement Close Day" type="number" value={cardF.closeDay} onChange={e=>setCardF({...cardF,closeDay:e.target.value})} placeholder="7"/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,color:C.textSecondary,marginBottom:6}}>Card Color</label>
            <input type="color" value={cardF.color} onChange={e=>setCardF({...cardF,color:e.target.value})} style={{width:48,height:36,borderRadius:6,border:"none",cursor:"pointer"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn style={{flex:1}} onClick={addCard}>Add Card</Btn>
          </div>
        </Modal>
      )}
      {detailCard&&<CardDetailModal card={detailCard} onClose={()=>setDetailCard(null)}/>}
    </div>
  );
}
