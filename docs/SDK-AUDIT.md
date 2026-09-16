# Аудит TypeScript / JavaScript SDK

## Статус исправлений — 2026-09-07

Все перечисленные ниже SDK-находки исправлены. Каноническая публичная схема
перегенерирована: **81 операция, 129 схем**. Все три SDK используют побайтово
одинаковую копию; SHA-256 и коммит источника закреплены в `openapi/source.json`.
Сгенерировано **79 поддерживаемых операций / 17 ресурсов**: две отключённые
sessions-management операции исключены по согласованному решению, без удаления
sticky-параметров генерации прокси и без изменения маршрутов бэкенда.

| Находка | Исправление |
| --- | --- |
| TS-01 | Добавлены verifyOtp и union 200/202 для password/Google login. |
| TS-02 | setupTwoFactor передаёт body с password/credential и текущим code при замене MFA. |
| TS-03 | Обновлены gateway, валюта, суммы и checkout-поля; будущие gateway-строки не ломают типы. |
| TS-04 | User описывает оба режима; InvoiceRead — union Invoice и InvoiceShort; допустимые null отражены в схеме. |
| TS-05 | Счётчики вычисляются, operationId проверяются, manifest сверяется с SHA-256 и покрытием. |
| BE-01 | Исправлены pk-сигнатуры invoice PDF/pay-link и coupon redeems; добавлены router-регрессии. |
| BE-02 | Удалены публичный sessions-ресурс, его методы и отдельные сгенерированные модели/документы из SDK. |

Проверки SDK: `npm run verify` (21 тест, типизация, линтер, сборка, package validation/smoke), `npm run test:browser` (1 тест).
Фикстуры форм User/Invoice получены из реальных сериализаторов бэкенда на
синтетических объектах; серверный тест проверяет их соответствие текущему коду.
Тесты SDK проверяют MFA, платежи, вариативные ответы и регрессионные сценарии.
Это локальная проверка, не подтверждение развёртывания в production.

Версии пакетов не изменялись; релизы, теги и публикации пакетов не создавались.
Примеры миграции и MFA: `docs/backend-compatibility.md` внутри репозитория SDK.

## Исходный аудит (до исправлений)

Ссылки на SDK закреплены на исходном коммите. Пути и номера строк бэкенда
сохранены как исторические ориентиры: его исходное рабочее состояние содержало
незакоммиченные изменения.

Далее сохранён исторический отчёт. Его выводы, счётчики, матрица и номера строк
относятся к исходному состоянию и не являются описанием обновлённой SDK.


SDK: `@proxyrequest/sdk` 1.0.0, каталог `javascript-sdk`, HEAD `0b2ddca2255367c9404ae3af2d1c167162a6a76b`.

**Вывод:** HTTP-покрытие старого контракта полное, но текущие MFA-сценарии несовместимы, платёжные и конфигурационно-зависимые модели устарели. JavaScript часто сохраняет новые поля в объекте ответа, тогда как TypeScript запрещает корректные запросы или обещает поля, которых сервер не возвращает.

## Границы и методика

Аудит выполнен 2026-09-07 по рабочим файлам. Бэкенд: `/home/yuri/Projects/papaproxy/api`, HEAD `f10464717b19f98916b45cc25e7405610865957d`, с существующими незакоммиченными изменениями. Выводы относятся к этому рабочему состоянию, а не только к коммиту и не к проверенному production-развёртыванию.

Проверены публичная OpenAPI-схема (`api/openapi.yml`), состав публичного schema URLConf (`api/apps/routing/infrastructure/django/schema.py:35`), router, существенные serializers/viewsets, сгенерированные операции, клиентский транспорт, пагинация, ошибки, подписи webhook и процесс синхронизации схемы. Внутренние/admin API и входящие callback-маршруты платёжных провайдеров не считаются обязательными методами клиентской SDK.

Сохранённый публичный контракт содержит **81 операцию и 127 схем**. Независимая генерация публичной схемы в тестовом окружении также дала 81 операцию и 127 схем. Отдельно проверены оба значения `SITE_PACKAGE_BASED_AUTH`: формы ответов действительно зависят от настройки. Различия числовых ограничений при генерации под SQLite не объявлялись дефектами production-контракта.

Во всех SDK сохранена одна и та же старая схема: **80 операций и 124 схемы**. Сопоставление HTTP-методов, шаблонов путей и публичных обёрток не выявило пропущенных операций из этой старой схемы. Единственная отсутствующая операция относительно текущего публичного списка — `POST /login/otp`. Это номинальное покрытие методов, а не оценка фактической совместимости.

SHA-256 схем:

- текущая API: `423fc57ebe9406a9a1a80ee7acfd8e0827f6196b317af90b0c24f64172e16b03`;
- сохранённая SDK: `0ed69e781aa752ac8e9c9b1974cd82810adbf1fd99a461724bd73432740d8737`.

Поиск выполнен через knowledge graph с проверкой покрытия и чтением исходников. Частично разобранные TypeScript re-export строки проверены непосредственно. Проигрывались синтетические ответы и локальные вызовы serializers/router; обращений к рабочему API, создания пользователей/счетов и изменений реализаций SDK/бэкенда не выполнялось.

Приоритеты: **P1** — блокирует основной сценарий при указанных условиях; **P2** — ограничивает часть API, искажает данные или ухудшает диагностику/сопровождение. Порядок внутри приоритета отражает рекомендуемую последовательность исправлений.


## Находки в SDK

### TS-01 · P1 · Невозможно завершить вход с OTP; ответ 202 имеет неверный тип

`authorization.login()` и `loginWithGoogle()` объявляют только результат с `token` и `refresh`. Бэкенд для аккаунта с MFA возвращает HTTP 202:

```json
{"status":"otp_required","challenge":"single-use-challenge","expires_in":300}
```

Транспорт принимает любой успешный HTTP-статус и приводит JSON к заявленному `Result`. В локальной проверке `loginWithResponse()` вернул `statusCode=202` и объект challenge, но `data.token === undefined`. Компилятор при этом сообщает, что `challenge` отсутствует на типе результата. Метода для `POST /login/otp` нет.

Последствие: код, который после разрешения Promise считает пользователя авторизованным, получает отсутствующие токены; штатного продолжения MFA в типизированной SDK нет.

Источники: [AuthorizationResource](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/resources.ts#L649), [приведение ответа к Result](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/client.ts#L192), контракт OTP (`api/openapi.yml:8553`), VerifyLoginOTPView (`api/apps/core/authentication/api.py:57`), Google sign-in (`api/apps/core/api/viewsets.py:1407`).

Исправление: добавить модели challenge/verify, метод завершения входа и различимый результат 200/202. Проверить оба способа входа и последующий обмен `challenge + code` на токены.

### TS-02 · P1 · setupTwoFactor не передаёт обязательное подтверждение личности

`profile.setupTwoFactor()` не имеет параметра `body` и отправляет пустой POST. Бэкенд теперь требует действующий пароль либо Google `credential`; при замене включённого аутентификатора также нужен текущий `code`. `disableTwoFactor()` типизирует тело только как `{code: string}`, хотя отключение активной 2FA также требует пароль/credential.

Локально подтверждено пустое тело setup-запроса. Компилятор отвергает и `setupTwoFactor({body: ...})`, и `disableTwoFactor({body: {code, password}})`.

Источники: [setupTwoFactor](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/resources.ts#L2521), [TwoFactorDisableRequest](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/schema.ts#L2925), TwoFactorViewSet (`api/apps/core/api/viewsets.py:1522`), require_primary_factor (`api/apps/core/authentication/service.py:192`).

Исправление: регенерировать обе модели запросов, передавать body для setup, описать первоначальную настройку/замену/отключение. После успешного изменения MFA учитывать отзыв ранее выданных JWT. `confirmTwoFactor({body:{code}})` по форме запроса остаётся совместимым; изменение примеров в OpenAPI само по себе не является дефектом этого метода.

### TS-03 · P2 · Новые платёжные шлюзы, валюта и состояние checkout отсутствуют в типах

В запросе создания счёта разрешены только `crypto | wallet | manual | stripe`. Бэкенд также поддерживает `credit_card` и конкретные провайдеры, например `whitepay`, `wayforpay`, `monobank`, `liqpay`. Отсутствует `payment_currency`, необходимая для явного выбора валюты регионального провайдера.

Устарели также тип фильтра `invoices.list({gateway})` и модель ответа `Invoice`. В ней отсутствуют `currency`, `payment_amount`, `payment_currency`, `provider_checkout_id`, `provider_payment_id`, `checkout_status`, поля `fx_*`; сохранены уже удалённые из публичного ответа `coinbase_charge_id` и `coingate_order_token`. В `SettingsResponse` нет `payment_gateways` с возможностями и валютами провайдеров.

Компилятор воспроизвёл:

```text
TS2322: Type '"whitepay"' is not assignable to type '"stripe" | "wallet" | "manual" | "crypto"'.
TS2353: 'payment_currency' does not exist in the invoice request type.
TS2339: Property 'payment_amount' does not exist on the invoice response type.
```

Runtime JSON не фильтруется: новые поля ответа физически сохраняются. Поэтому это ограничение типизированного API, а не доказательство, что JavaScript не способен вызвать новый gateway. Обход через `request()` возможен, но теряет типовую поддержку.

Источники: [платёжные типы](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/schema.ts#L1754), [SettingsResponse](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/schema.ts#L2804), InvoiceCreateSerializer (`api/apps/billing/api/serializers.py:126`), InvoiceSerializer (`api/apps/billing/api/serializers.py:28`), PaymentGateway (`api/openapi.yml:18607`).

Исправление: обновить запросы, фильтры, ответы и примеры checkout. Для новых значений gateway предусмотреть расширяемый string-тип. Ошибку создания checkout HTTP 502 транспорт уже нормализует; `invoice_id` и `retryable` следует разбирать из payload, а не повторять создание счёта как заведомо не состоявшееся.

### TS-04 · P2 · Типы User и Invoice не отражают допустимые ответы бэкенда

Есть два независимых расхождения.

1. `Invoice.package`, `country` и `coupon` объявлены объектами без `null`. Реальные поля модели nullable, а `InvoiceSerializer` на счёте пополнения баланса возвращает все три как `null`. Например, `invoice.package.name` проходит проверку типов, но падает при исполнении.
2. При `SITE_PACKAGE_BASED_AUTH=True` `UserSerializer` возвращает `orders` вместо `data`, `data_spent`, `data_updated`, `proxy_password`, `proxy_password_reset`. Тип `User` содержит второй набор как обязательные поля и не содержит `orders`. При `False` методы чтения счетов используют `InvoiceShortSerializer`, который исключает, среди прочего, `package`, `user_id`, `type`, `payment_url`, но SDK всё равно обещает полный `Invoice`.

В тестовой генерации схемы и при проверке serializers оба режима подтверждены. Значение настройки на production не устанавливалось; это условные проблемы поддерживаемых конфигураций.

Источники: [Invoice/User types](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/schema.ts#L1754), [User](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/src/generated/schema.ts#L2934), динамические поля User (`api/apps/core/api/serializers/users.py:269`), выбор InvoiceSerializer (`api/apps/billing/api/viewsets.py:121`), InvoiceShortSerializer (`api/apps/billing/api/serializers.py:101`).

Исправление: сначала привести серверную OpenAPI к реальной nullable/вариативной форме, затем регенерировать модели. Нужны отдельные модели/union для режимов либо стабильная общая форма ответа. Простая синхронизация текущего `openapi.yml` не устранит все эти расхождения.

### TS-05 · P2 · Метаданные схемы неверны, штатное обновление контракта заблокировано

[openapi/source.json](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/openapi/source.json#L1) заявляет **82 операции, 127 схем** и SHA-256 `bd1528198b74ac295396aef23333368e9a358b31e558d6cd0a01d286983f0ae6`. Фактический файл содержит **80/124** и другой SHA-256, приведённый выше.

[sync-openapi.ts](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/scripts/sync-openapi.ts#L30) принимает только 82/127. Выполненный запуск с текущим бэкендом завершился до записи файлов:

```text
Error: Unexpected contract size: 81 operations and 127 schemas.
```

[Контрактный тест](https://github.com/proxyrequest/javascript-sdk/blob/0b2ddca2255367c9404ae3af2d1c167162a6a76b/tests/contract.test.ts#L10) проверяет наличие 80 методов относительно собственной старой схемы, но не проверяет соответствие SHA-256 манифесту. Поэтому обычные тесты проходят при недостоверных метаданных.

Исправление: пересоздать manifest из фактического файла, убрать зависимость sync от единственного числа операций, проверять digest и семантический diff с выбранной ревизией публичного API. После обновления добавить mapping для OTP и контрактные сценарии из этого отчёта.

## Проблемы бэкенда, влияющие на эту SDK

### BE-01 · P1 · Три публичных detail-маршрута падают при передаче `pk`

| HTTP-маршрут | Обработчик |
| --- | --- |
| `GET /invoices/{id}/download/pdf` | `InvoicesViewSet.download_pdf(self, request)` |
| `GET /invoices/{id}/pay` | `InvoicesViewSet.pay_link(self, request)` |
| `GET /coupons/{id}/redeems` | `CouponsViewSet.redeems(self, request)` |

DRF router передаёт идентификатор как `pk`, но обработчики не принимают ни `pk`, ни `**kwargs`. Через настоящий `django.urls.resolve()` и вызов соответствующего view воспроизведены:

```text
TypeError: InvoicesViewSet.download_pdf() got an unexpected keyword argument 'pk'
TypeError: InvoicesViewSet.pay_link() got an unexpected keyword argument 'pk'
TypeError: CouponsViewSet.redeems() got an unexpected keyword argument 'pk'
```

При проверке были заменены только `initial()` и обработка исключения, чтобы изолировать диспетчеризацию от авторизации и БД. Это подтверждённая ошибка вызова обработчика, а не результат запроса к развёрнутому серверу. SDK формируют правильные HTTP-методы и пути; исправление требуется на стороне API.

Источники: InvoicesViewSet (`api/apps/billing/api/viewsets.py:197`), CouponsViewSet.redeems (`api/apps/marketing/api/viewsets.py:444`), регистрация router (`api/apps/routing/infrastructure/django/public.py:95`).

Исправление: принимать `pk=None` или `*args, **kwargs`; добавить HTTP-тесты всех трёх detail-action через router. После этого повторить интеграционные проверки SDK для платёжной ссылки, PDF и погашений купона.

### BE-02 · P2 · Управление sessions отключено, хотя SDK обещает успешные ответы

Авторизованные `GET /sessions` и `DELETE /sessions/{id}` безусловно вызывают `_unavailable()` и возвращают 403 с причиной `errors.proxy.session_ownership_unavailable`. Актуальная схема уже не содержит успешного ответа для этих операций; сохранённая схема SDK всё ещё содержит старые `SessionListResponse` / `SessionDeleteResponse`.

Это ограничение текущего API, а не неправильный ключ пользователя. Следует отметить методы как временно недоступные/deprecated и обновить документацию. Возвращать возможность управления сессиями нужно только после реализации проверки владельца на сервере.

Источник: SessionViewSet (`api/apps/core/api/viewsets.py:1622`).


## Что проверено и работает в рассмотренных сценариях

- Все 80 старых операций имеют публичные методы и варианты `WithResponse`; HTTP-методы/пути соответствуют сохранённому контракту.
- Заголовки `Authorization: Static ...` и `Bearer ...`, язык, ETag/If-Match и idempotency реализованы; поддерживаемые операции получают один ключ на попытки повторного запроса.
- Пагинатор извлекает offset и повторно вызывает тот же ресурс, а не отправляет авторизацию на URL из `next`.
- Проверка webhook соответствует фактическому accountant sender: `X-Signature` содержит стандартный Base64 от HMAC-SHA256 по точным байтам исходного тела. Timestamp в подпись не входит.
- `request()` позволяет временно вызвать новый endpoint; отсутствие типизированного метода не означает отсутствие низкоуровневого обхода.

## Проверки и порядок исправлений

`npm test -- --reporter=dot`: **17 passed**, 4 файла. `npm run typecheck`: **успешно**. Отдельная проверка TypeScript Compiler API на корректных для нового API вызовах дала шесть ожидаемых ошибок типов: OTP challenge, body setup, password disable, gateway, payment_currency, payment_amount. Мок HTTP 202 подтвердил различие между объявленным типом и реальным результатом.

Рекомендуемый порядок: исправить BE-01 в API; согласовать серверные формы User/Invoice; обновить схему/mapping/manifest; реализовать MFA; обновить платежи; добавить тесты на реальные варианты ответов. Проверять нужно не только существование методов, но и разбор 202, nullable invoice, оба auth-режима и новые шлюзы.

## Полная матрица методов

В таблице «есть» означает наличие HTTP-операции в публичной обёртке. Ограничения и ошибки описаны выше. Указаны основные методы; варианты `WithResponse` не дублируются.

| HTTP | Путь | Метод SDK |
| --- | --- | --- |
| GET | `/affiliates` | `affiliates.list()` |
| GET | `/affiliates/rewards` | `affiliates.listRewards()` |
| GET | `/affiliates/rewards/overall` | `affiliates.getRewardsOverall()` |
| GET | `/analytics/{id}/transactions` | `analytics.getTransactions()` |
| GET | `/analytics/connections` | `analytics.getConnections()` |
| GET | `/analytics/domains` | `analytics.listDomains()` |
| GET | `/analytics/feed` | `analytics.listFeed()` |
| GET | `/analytics/logs` | `analytics.listLogs()` |
| GET | `/analytics/overall` | `analytics.getOverall()` |
| GET | `/api-keys` | `apiKeys.list()` |
| POST | `/api-keys` | `apiKeys.create()` |
| DELETE | `/api-keys/{id}` | `apiKeys.delete()` |
| GET | `/coupons` | `coupons.list()` |
| POST | `/coupons` | `coupons.create()` |
| GET | `/coupons/{id}` | `coupons.get()` |
| PUT | `/coupons/{id}` | `coupons.replace()` |
| PATCH | `/coupons/{id}` | `coupons.update()` |
| DELETE | `/coupons/{id}` | `coupons.delete()` |
| GET | `/coupons/{id}/redeems` | `coupons.listRedeems()` |
| POST | `/coupons/calculate-price` | `coupons.calculatePrice()` |
| GET | `/integrations/telegram/connection` | `telegram.getConnection()` |
| PATCH | `/integrations/telegram/connection` | `telegram.updateConnection()` |
| DELETE | `/integrations/telegram/connection` | `telegram.deleteConnection()` |
| POST | `/integrations/telegram/link` | `telegram.createLink()` |
| GET | `/invoices` | `invoices.list()` |
| POST | `/invoices` | `invoices.create()` |
| GET | `/invoices/{id}` | `invoices.get()` |
| DELETE | `/invoices/{id}` | `invoices.delete()` |
| GET | `/invoices/{id}/download/pdf` | `invoices.downloadPdf()` |
| GET | `/invoices/{id}/pay` | `invoices.getPaymentLink()` |
| GET | `/locations/asn` | `locations.listAsns()` |
| GET | `/locations/cities` | `locations.listCities()` |
| GET | `/locations/cities/{id}` | `locations.getCity()` |
| GET | `/locations/continents` | `locations.listContinents()` |
| GET | `/locations/continents/{id}` | `locations.getContinent()` |
| GET | `/locations/countries` | `locations.listCountries()` |
| GET | `/locations/countries/{id}` | `locations.getCountry()` |
| GET | `/locations/isps` | `locations.listIsps()` |
| GET | `/locations/regions` | `locations.listRegions()` |
| GET | `/locations/regions/{id}` | `locations.getRegion()` |
| POST | `/login` | `authorization.login()` |
| POST | `/login/google` | `authorization.loginWithGoogle()` |
| POST | `/login/otp` | **Отсутствует — TS-01** |
| GET | `/news` | `news.list()` |
| GET | `/orders` | `orders.list()` |
| GET | `/orders/{id}` | `orders.get()` |
| PATCH | `/orders/{id}` | `orders.updateAutoRenewal()` |
| DELETE | `/orders/{id}` | `orders.delete()` |
| GET | `/packages` | `packages.list()` |
| GET | `/packages/commissions` | `packages.listCommissions()` |
| GET | `/profile` | `profile.get()` |
| PATCH | `/profile` | `profile.update()` |
| DELETE | `/profile` | `profile.delete()` |
| POST | `/profile/2fa/confirm` | `profile.confirmTwoFactor()` |
| POST | `/profile/2fa/disable` | `profile.disableTwoFactor()` |
| POST | `/profile/2fa/setup` | `profile.setupTwoFactor()` |
| GET | `/profile/2fa/status` | `profile.getTwoFactorStatus()` |
| POST | `/profile/change-password` | `profile.changePassword()` |
| POST | `/proxies/generate` | `proxies.generate()` |
| POST | `/recover-password` | `authorization.recoverPassword()` |
| POST | `/refresh` | `authorization.refresh()` |
| POST | `/reset-password` | `orders.resetPassword()` |
| GET | `/rewards` | `rewards.list()` |
| POST | `/rewards/claim` | `rewards.claim()` |
| GET | `/sessions` | `sessions.list()` |
| DELETE | `/sessions/{id}` | `sessions.delete()` |
| GET | `/settings` | `settings.get()` |
| POST | `/signup` | `authorization.signup()` |
| GET | `/users` | `users.list()` |
| POST | `/users` | `users.create()` |
| GET | `/users/{id}` | `users.get()` |
| PATCH | `/users/{id}` | `users.update()` |
| DELETE | `/users/{id}` | `users.delete()` |
| POST | `/users/{id}/data/add` | `users.addData()` |
| POST | `/users/{id}/data/subtract` | `users.subtractData()` |
| GET | `/users/{id}/orders` | `users.listOrders()` |
| POST | `/users/{id}/password` | `users.resetPassword()` |
| GET | `/webhooks` | `webhooks.list()` |
| POST | `/webhooks` | `webhooks.create()` |
| GET | `/webhooks/{id}` | `webhooks.get()` |
| DELETE | `/webhooks/{id}` | `webhooks.delete()` |
