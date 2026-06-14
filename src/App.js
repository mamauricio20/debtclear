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
  {value:"weekly",    label:"Weekly",         mult:52/12},
  {value:"biweekly",  label:"Bi-Weekly",      mult:26/12},
  {value:"semimo",    label:"Semi-Monthly",   mult:2},
  {value:"monthly",   label:"Monthly",        mult:1},
  {value:"yearly",    label:"Yearly",         mult:1/12},
];
const toMonthly = (amt,freq) => (+amt||0) * (FREQ.find(f=>f.value===freq)?.mult||1);

const CATS      = ["Groceries","Dining","Gas","Shopping","Subscriptions","Travel","Healthcare","Entertainment","Other"];
const BILL_CATS = ["Housing","Utilities","Insurance","Subscriptions","Transport","Health","Education","Other"];
const INC_TYPES = ["salary","hourly","freelance","rental","investment","benefits","other"];

const INIT_INCOME = [
  {id:1,label:"Primary Job",amount:5200,freq:"monthly",type:"salary"},
  {id:2,label:"Side Gig",   amount:400, freq:"monthly",type:"other"},
];
const INIT_BILLS = [
  {id:1,label:"Rent",         amount:1350,cat:"Housing"},
  {id:2,label:"Car Insurance",amount:142, cat:"Insurance"},
  {id:3,label:"Phone",        amount:85,  cat:"Utilities"},
  {id:4,label:"Internet",     amount:60,  cat:"Utilities"},
  {id:5,label:"Gym",          amount:40,  cat:"Health"},
];
const INIT_CARDS = [
  {id:1,name:"Chase Sapphire",  limit:10000,balance:3840,apr:22.99,dueDay:15,closeDay:7, color:"#4A90E2"},
  {id:2,name:"Citi Double Cash",limit:7500, balance:1220,apr:19.99,dueDay:22,closeDay:14,color:"#00E5A0"},
  {id:3,name:"Discover It",     limit:5000, balance:950, apr:17.24,dueDay:8, closeDay:28,color:"#F5A623"},
];
const INIT_EXPENSES = [
  {id:1,date:"2026-06-10",desc:"Whole Foods",amount:94.32,cardId:1,cat:"Groceries"},
