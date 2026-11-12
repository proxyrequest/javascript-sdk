# Independent customer traffic (backend extension)

The existing users addData / subtractData methods (Python: add_data / subtract_data)
now support independent customers when authenticated as an active superuser.
No signature or response type changes are required. Send package_id and positive
integer-byte data, and persist one Idempotency-Key per logical operation.

Add creates a missing finite residential order without an invoice or wallet debit.
Subtract removes only available unexpired bytes; insufficient data fails atomically.
Usage history and existing expiration dates remain unchanged. Reset uses resetData
(reset_data), with package_id only. Existing parent/child allocation behavior remains.

Independent customer grants require the corresponding PapaProxy API update.
The SDK release alone does not enable this server-side capability. Existing
released SDK methods can serialize the same requests.
