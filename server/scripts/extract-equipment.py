"""Read the supplied workbooks without modifying them; emit normalized import JSON."""
import sys, json, datetime, collections
import openpyxl

def value(v):
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime('%Y-%m-%d')
    if isinstance(v, float) and v.is_integer(): return int(v)
    return v.strip() if isinstance(v, str) else v

ont_keys = ['item_code','receiving_date','reservation_number','serial_number','quantity','model','po_number']
cpe_keys = ['reference','stock_type','service','order_number','installation_date','cost_center','exchange','block','road','house','flat','asset_description','quantity','po_number','asset_class','serial_number','contractor','connection_type','lo_name','labor_charge','cpe_charge']
records=[]
for kind,path in [('ont',sys.argv[1]),('cpe',sys.argv[2])]:
    workbook=openpyxl.load_workbook(path,read_only=True,data_only=True)
    for sheet in workbook:
        if kind=='ont' and sheet.title.lower().strip()!='anisa overall sheet': continue
        header=1 if kind=='ont' else 3 if sheet.title in ['W5','1G CPE Replacement'] else 0 if sheet.title=='TBA' else 2
        keys=ont_keys if kind=='ont' else ['serial_number','order_number'] if sheet.title=='TBA' else cpe_keys[1:] if sheet.title=='FTTR' else cpe_keys
        for rownum,row in enumerate(sheet.values,1):
            if rownum<=header or not any(v is not None and str(v).strip() for v in row): continue
            data={k:value(row[i]) if i<len(row) else None for i,k in enumerate(keys)}
            category=str(data.get('model') or 'Unspecified') if kind=='ont' else 'Delivery Assurance' if sheet.title in ['2023','2024','2025','2026 Delivery Assurance'] else sheet.title.strip()
            records.append(dict(kind=kind,category=category,data=data,source_file=path.replace('\\','/').split('/')[-1],source_sheet=sheet.title,source_row=rownum,source_year=sheet.title[:4] if sheet.title[:4].isdigit() else None,original_data=[value(v) for v in row]))
    workbook.close()
with open(sys.argv[3],'w',encoding='utf-8') as f: json.dump(records,f,ensure_ascii=False)
print(json.dumps(collections.Counter(r['kind']+': '+r['category'] for r in records),indent=2))
print('Records missing serial:',sum(not r['data'].get('serial_number') for r in records))
