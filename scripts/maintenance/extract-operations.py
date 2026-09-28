"""One-time migration input. Production code never reads these workbooks."""
import pathlib,sys,json,datetime,re
import openpyxl
def val(v):
 if isinstance(v,(datetime.timedelta,datetime.time)):return str(v)
 if isinstance(v,(datetime.datetime,datetime.date)):return v.isoformat()
 if isinstance(v,float) and v.is_integer():return int(v)
 return v
def key(v):return re.sub(r'[^a-z0-9]+',' ',str(v or '').lower()).strip()
with open(sys.argv[2],'w',encoding='utf-8') as out:
 for p in pathlib.Path(sys.argv[1]).glob('*.xlsx'):
  w=openpyxl.load_workbook(p,read_only=True,data_only=True)
  count=0
  for sheet in w:
   iterator=iter(sheet.values); first=[]
   for i in range(6):
    try:first.append(next(iterator))
    except StopIteration:break
   # Preserve every nonempty row, including headers/notes, in the history table.
   candidates=[(sum(isinstance(v,str) and bool(v.strip()) for v in row),i) for i,row in enumerate(first)]
   header=max(candidates,default=(0,0))[1]
   if p.name=='logistics.xlsx' or p.name=='team.xlsx' or sheet.title=='staff details':header=0
   headings=first[header] if first else []
   from itertools import chain
   for rownum,row in enumerate(chain(first,iterator),1):
    if not any(v is not None and str(v).strip() for v in row):continue
    data={};seen={}
    for i,v in enumerate(row):
     if v is None:continue
     name=key(headings[i] if i<len(headings) else '') or 'column '+str(i+1)
     seen[name]=seen.get(name,0)+1
     if seen[name]>1:name+=' '+str(seen[name])
     data[name]=val(v)
    dataset='reference'
    if rownum>header+1:
     if p.name.startswith('Contact') and sheet.title=='staff details':dataset='staff'
     elif p.name=='logistics.xlsx' and sheet.title==w.sheetnames[0]:dataset='logistics'
     elif p.name=='team.xlsx' and 'form responses' in sheet.title.lower():dataset='team'
     elif p.name.startswith('Response Sheet') and 'form responses' in sheet.title.lower():dataset='response'
     elif p.name.startswith('WBS') and ('order details' in sheet.title.lower() or re.match(r'^\d+-\w+',sheet.title)):dataset='wbs'
     elif p.name.startswith('Delivery Material') and sheet.title=='Material sheet':dataset='material'
     elif p.name.startswith('ONT'):dataset='ont_reference'
     elif p.name.startswith('CPE'):dataset='cpe_reference'
    out.write(json.dumps(dict(source_file=p.name,source_sheet=sheet.title,source_row=rownum,dataset=dataset,data=data,original_cells=[val(v) for v in row]),ensure_ascii=False)+'\n');count+=1
  w.close();print(p.name,count,flush=True)
