from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from accounts import ACCOUNTS
from aws_cost import get_contract_summary
from openpyxl import Workbook
import io
 
app = FastAPI(title="AWS Cost Monitoring")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)
 
@app.get("/accounts")
def list_accounts():
    result = []
    for a in ACCOUNTS:
        try:
            entry = {
                "account_id": a["id"],
                "name": a["name"],
                "onboard_date": a.get("onboard_date", "Not set in data"),  # safe
                "contracts": [
                    {
                        "contract_id": c["contract_id"],
                        "start_date": c["start_date"],
                        "quoted_cost": c["quoted_cost"]
                    } for c in a.get("contracts", [])  # also safe
                ]
            }
            result.append(entry)
        except KeyError as e:
            print(f"Error in account data: missing key {e} in account {a.get('id', 'unknown')}")
            # continue or add partial entry
    return result
 
@app.get("/accounts/{account_id}/contracts/{contract_id}")
def contract_summary(account_id: str, contract_id: str):
    acc = next((a for a in ACCOUNTS if a["id"] == account_id), None)
    if not acc:
        raise HTTPException(404, "Account not found")
 
    contract = next((c for c in acc["contracts"] if c["contract_id"] == contract_id), None)
    if not contract:
        raise HTTPException(404, "Contract not found")
 
    return get_contract_summary(acc, contract)
 
@app.get("/accounts/{account_id}/contracts/{contract_id}/export")
def export_excel(account_id: str, contract_id: str):
    data = contract_summary(account_id, contract_id)
 
    wb = Workbook()
    ws = wb.active
    ws.append(["Month", "Actual", "Quoted", "Variance", "Status"])
 
    for m in data["monthly"]:
        ws.append([m["month"], m["actual"], m["quoted"], m["variance"], m["status"]])
 
    ws.append(["TOTAL", data["total_actual"], data["total_quoted"], data["total_variance"], ""])
 
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
 
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=cost_report.xlsx"}
    )