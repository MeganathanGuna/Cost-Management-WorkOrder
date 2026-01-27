from datetime import datetime, timedelta
 
_CACHE = {}
 
def get_cache(key):
    entry = _CACHE.get(key)
    if not entry:
        return None
    value, expiry = entry
    if datetime.utcnow() > expiry:
        del _CACHE[key]
        return None
    return value
 
def set_cache(key, value, ttl_minutes=60):
    _CACHE[key] = (value, datetime.utcnow() + timedelta(minutes=ttl_minutes))