from pydantic import BaseModel

class OperationSuccessfulResponse(BaseModel):
    ok: bool
