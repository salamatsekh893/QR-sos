# Security Specification for SAFE LIFE Emergency QR Platform

## Data Invariants
1. Users can only manage their own profile, emergency contacts, medical profile, and orders.
2. SOS Alerts can be created by authenticated users and read by all signed-in users/emergency responders for live updates.
3. QR code identities can be read publicly (so emergency responders/scanners can view emergency QR card data) and written/edited by the tag owner or admins.

## Dirty Dozen Payloads & Test Scenarios
1. Anonymous user attempting to create an SOS alert with fake user ID.
2. User trying to overwrite another user's medical profile.
3. User attempting to delete another user's QR tag.
4. Non-admin user escalating role field to "Super Admin".
5. Malformed SOS payload with missing latitude/longitude coordinates.
6. Spoofed email address without verification.
7. Modifying created_at timestamp on SOS alert.
8. Modifying order total to 0.
9. Injecting script payloads into user profile names.
10. Attempting to fetch all user profiles without authentication.
11. Updating wallet transactions belonging to another user.
12. Attempting to tamper with someone else's emergency contact phone number.
