import boto3
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from cache import get_cache, set_cache
 
def ce_client(account):
    return boto3.client(
        "ce",
        aws_access_key_id=account["access_key"],
        aws_secret_access_key=account["secret_key"],
        region_name="us-east-1"
    )
 
def fetch_ce_cost(ce, start, end):
    cache_key = f"{start}:{end}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached
 
    res = ce.get_cost_and_usage(
        TimePeriod={"Start": start, "End": end},
        Granularity="MONTHLY",
        Metrics=["UnblendedCost"]
    )
    amount = float(res["ResultsByTime"][0]["Total"]["UnblendedCost"]["Amount"])
    set_cache(cache_key, amount)
    return amount
 
def get_contract_summary(account, contract):
    ce = ce_client(account)
    start_date = datetime.strptime(contract["start_date"], "%Y-%m-%d").date()
    quoted = contract["quoted_cost"]
    historical = contract.get("historical_costs", {})
    today = date.today().replace(day=1)
 
    monthly = []
    total_actual = total_quoted = 0.0
    last_actual = 0.0
 
    for i in range(12):
        month_start = start_date + relativedelta(months=i)
        month_end = month_start + relativedelta(months=1)
        key = month_start.strftime("%Y-%m")
 
        if key in historical:
            actual = historical[key]
            status = "BILLED (LEGACY)"
        elif month_start <= today:
            try:
                actual = fetch_ce_cost(
                    ce,
                    month_start.strftime("%Y-%m-%d"),
                    month_end.strftime("%Y-%m-%d")
                )
                status = "BILLED"
            except Exception:
                actual = last_actual
                status = "ESTIMATED"
        else:
            actual = last_actual
            status = "ESTIMATED"
 
        if actual > 0:
            last_actual = actual
 
        variance = actual - quoted
 
        monthly.append({
            "month": key,
            "actual": round(actual, 2),
            "quoted": quoted,
            "variance": round(variance, 2),
            "status": status
        })
 
        total_actual += actual
        total_quoted += quoted
 
    return {
        "contract_id": contract["contract_id"],
        "start_date": contract["start_date"],
        "monthly": monthly,
        "total_actual": round(total_actual, 2),
        "total_quoted": round(total_quoted, 2),
        "total_variance": round(total_actual - total_quoted, 2)
    }