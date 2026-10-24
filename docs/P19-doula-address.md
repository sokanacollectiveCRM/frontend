# P-19: private US doula addresses

The Address step remains part of the seven-step profile slider. Country is no
longer shown or submitted. Unit / Apt # is optional and appears immediately
after street address. Save Changes returns to the saved profile; Cancel discards
the draft.

Saved addresses display as `100 Fictional Way, Apt 4B, Chicago, IL 60601`. Older
addresses without units display as `100 Fictional Way, Chicago, IL 60601`. The
doula and admins can see this address, including in Review profile & documents.
Clients cannot see the doula address.

The backend owns the country default (`United States`). Existing stored country
values are retained. The existing country column remains in place for
integrations. Card billing still sends its existing ISO `US` integration value
without a country input.

A photo uploaded through the doula profile now also updates shared user state,
so Account and the header display the saved photo during navigation.

DEV checks to perform using an already authenticated account:

1. Open Address: confirm Country is absent in view and edit modes.
2. Enter a unit, save, refresh, and confirm it persists. Clear it, save, and
   refresh again.
3. Confirm the address format in the admin doula detail and Review profile &
   documents dialog. Confirm the client-facing doula view has no address.
4. Upload a photo in About you, then navigate through the profile menu to
   Account. Confirm the photo appears there and after refresh.

Do not use login, MFA, invitation, profile submission, approval, or email
actions for these checks.
