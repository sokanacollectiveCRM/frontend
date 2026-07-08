# Sokana CRM Platform SOP

Version: 1.0  
Last Updated: June 11, 2026  
Audience: Admins, intake staff, operations staff, doulas, and launch support staff

> **Family onboarding lifecycle (intake → contract → billing → portal):** See [`FAMILY_ONBOARDING_SOP.md`](./FAMILY_ONBOARDING_SOP.md) for the definitive end-to-end guide. This document covers broader daily CRM operations.

## Purpose

This SOP defines how staff should use the Sokana CRM during launch and daily operations so intake, follow-up, contracts, billing, doula assignment, and team coordination are handled consistently.

Use this document as the operating standard for:

- Request form intake
- Lead follow-up
- Client status management
- Contract generation
- Billing and payment tracking
- Doula assignment
- Team coordination
- Launch readiness review

## Platform Overview

The CRM supports the full client lifecycle from public intake to active service delivery and closeout. The main staff-facing areas are:

- `Dashboard`: high-level operational view
- `Inbox`: shared communication workspace
- `Leads`: intake records and lead management
- `Customers`: matched client records
- `Pipeline`: status-based workflow board
- `Contracts`: contract template management
- `Payments`: payment list and payment status tracking
- `Reconciliation`: invoice-to-payment matching review
- `Invoices`: invoice records
- `Team`: admin and doula directory management
- `Doulas`: doula directory and assignment management
- `QuickBooks`: integration status and accounting sync support
- `Demographics`: reporting and launch analytics

The public request form feeds lead records into the CRM. Admin staff then review the intake, update the client status, assign doulas, generate contracts, and track payments through completion.

## Staff Roles And Responsibilities

### Admin

- Monitor new leads and daily queue health
- Review intake details for completeness and accuracy
- Move clients through the correct pipeline status
- Generate and send contracts
- Track payments, invoices, and reconciliation issues
- Assign doulas and update assignment roles
- Invite or update team members
- Resolve exceptions or route them to the right owner

### Intake / Operations Staff

- Review new request form submissions
- Confirm contact information, services requested, referral source, and payment details
- Add notes for outreach attempts and client responses
- Keep statuses current so the team can trust the board
- Escalate contract, billing, or eligibility issues to admin

### Doula Team Members

- Keep profile, bio, documents, and availability current
- Review assigned clients and assignment details
- Log hours, updates, and care-related activities where required
- Surface service concerns, documentation gaps, or scheduling conflicts quickly

### Billing / Finance Support

- Review the `Payments`, `Invoices`, and `Reconciliation` pages
- Confirm successful payment capture and identify failed or pending items
- Coordinate follow-up on unpaid balances
- Confirm accounting sync and investigate QuickBooks-related issues

## Daily Admin Checklist

Complete this checklist at the start of each business day and again before close of day during launch.

- Open `Dashboard` and scan for obvious backlog, overdue follow-up, or payment issues.
- Open `Leads` and review all new request form submissions from the last 24 hours.
- Open each new lead profile and confirm:
  - contact details
  - requested services
  - referral source
  - insurance or payment method details
  - any notes requiring immediate outreach
- Add or update admin notes for every active lead touchpoint.
- Move each lead to the correct status in `Leads` or `Pipeline`.
- Review `Customers` for clients awaiting contract, payment, or assignment work.
- Review `Payments` for failed, pending, or missing payments.
- Review `Reconciliation` for invoice/payment mismatches that need manual follow-up.
- Review `Doulas` and `Team` for assignment gaps, missing documents, or staffing issues.
- Confirm urgent messages in `Inbox` have an owner.
- Before end of day, ensure every active client record has a current status and a latest note.

## New Request Form / Lead Intake Workflow

### Trigger

A client submits the public request form.

### Procedure

1. Open `Leads`.
2. Locate the new record by request date, client name, email, or phone number.
3. Open the lead profile.
4. Review and verify:
   - name and preferred contact details
   - requested services
   - due date or service timing details
   - referral source and any required `Other` follow-up text
   - insurance information or self-pay/payment method details
   - address, home details, and support context if relevant for matching
5. Add an admin note summarizing the intake review.
6. If data is incomplete, create a follow-up task in notes and contact the client.
7. Set the initial status:
   - `lead` for newly received intake not yet contacted
   - `contacted` once first outreach has been completed
8. If the client is not a fit or withdraws early, move to `not hired` and document why.

### Intake Data Quality Standard

Before moving a lead beyond `lead`, staff should confirm:

- the best contact method is known
- requested service type is clear
- payment pathway is identifiable
- referral source is captured accurately
- any conditional fields, especially `Other`, contain usable follow-up detail

## Pipeline Status Workflow

Use these statuses as the source of truth for client lifecycle tracking:

- `lead`: new intake received, not yet worked
- `contacted`: outreach started
- `matched`: operationally ready for active client management and shown in `Customers`
- `interviewing`: client and doula interview or fit review in progress
- `follow up`: awaiting client reply, internal decision, or next action
- `contract`: contract is being prepared, sent, or signed
- `active`: client is actively receiving services
- `complete`: services are finished
- `not hired`: intake did not convert

### Rules

- Update status the same day the work changes.
- Do not leave a client in `lead` after outreach has started.
- Do not move a client to `matched` until the team is ready to manage them as a customer record.
- Do not move a client to `active` until contract and payment requirements are satisfied and services have started.
- Always add a note when moving a client into `interviewing`, `follow up`, `contract`, `active`, or `not hired`.

### Recommended Flow

`lead` → `contacted` → `interviewing` or `follow up` → `matched` → `contract` → `active` → `complete`

Use `not hired` at any point when the client does not proceed.

## Client Management Workflow

Client management happens primarily in `Leads`, `Customers`, and the lead profile modal.

### Procedure

1. Open the client record.
2. Review profile sections, including contact info, services, notes, documents, payment details, and demographic details as needed.
3. Correct inaccurate intake information immediately.
4. Add notes for:
   - outreach attempts
   - client decisions
   - scheduling updates
   - internal handoffs
   - billing or insurance follow-up
5. Use the profile as the shared source of truth rather than keeping parallel offline notes.
6. If portal access is part of the workflow, only invite the client once eligibility conditions have been met in the system.

### Minimum Record Standard

Every active record should have:

- correct name and contact info
- current lifecycle status
- most recent staff note
- service type or services requested
- contract and payment progress visibility
- doula assignment status visibility where applicable

## Contract Workflow

The platform supports contract template management in `Contracts` and contract generation from the client workflow.

### Preparing Templates

1. Open `Contracts`.
2. Confirm the correct template exists for the service type.
3. Update or add templates before sending any launch contracts if language has changed.

### Generating A Contract

1. Open `Leads` or `Customers`.
2. Start the contract flow for the correct client.
3. Enter the contract details:
   - service type
   - total hours or support amount as applicable
   - hourly rate
   - deposit type and deposit value
   - installment count
   - payment cadence
4. Review the calculated totals and payment schedule.
5. Confirm client details before sending.
6. Generate and send the contract for signature.
7. Move the client to `contract` if not already there.
8. Add a note stating:
   - contract type
   - send date
   - any follow-up needed

### Contract Control Standard

- Do not send a contract until service scope and pricing are confirmed.
- Recheck email address before sending.
- If the contract is regenerated or corrected, document the reason in notes.

## Billing And Payment Schedule Workflow

Use `Payments`, `Invoices`, `Reconciliation`, and the client profile to track billing work.

### Payment Tracking

1. Open `Payments`.
2. Filter by client name, status, payment type, contract ID, or invoice ID as needed.
3. Review:
   - succeeded payments
   - pending payments
   - failed payments
   - refunded payments
4. Add notes to the client record for any billing follow-up needed.

### Invoice And Reconciliation Review

1. Open `Reconciliation`.
2. Review invoice status and suggested payment matches.
3. Use filters for date range and invoice status.
4. Export CSV if finance needs an offline review.
5. Treat reconciliation results as review guidance, not automatic approval.

### Billing Schedule Standard

- Confirm the deposit has been captured or properly scheduled after contract work.
- Monitor installment timing for active clients.
- Follow up on failed or pending transactions within one business day during launch.
- Keep finance-related notes in the client record so operations and billing stay aligned.

## Doula Assignment Workflow

Use `Doulas` for directory management and active assignment work.

### Procedure

1. Open `Doulas`.
2. Review the directory and current assignment counts.
3. Search for the client or doula involved.
4. Create or update the assignment.
5. Set the assignment role correctly, such as primary or backup where applicable.
6. Confirm service fit, timing, and any hospital or birth-outcome fields required by the workflow.
7. Add a client note documenting the assignment decision.
8. Notify the assigned doula through the agreed communication channel.

### Assignment Readiness Checks

Before confirming an assignment, verify:

- the doula has the required documents on file
- the doula profile is current
- the client service type matches the doula’s coverage
- the assignment role is correct
- any interview or fit discussion has been documented

## Team Coordination Workflow

Use `Team`, `Inbox`, client notes, and assignment records to coordinate staff work.

### Procedure

1. Use `Team` to review admin and doula records.
2. Invite new team members only after role and access level are confirmed.
3. Keep member names, roles, email addresses, bios, and addresses current where used operationally.
4. Review doula document completeness before relying on a doula for assignment.
5. Use client notes for client-specific handoffs.
6. Use `Inbox` or the team’s standard communication channel for urgent coordination.
7. When ownership changes, add a note that names the new owner and next action.

### Coordination Standard

- If a task affects a client record, document it in the CRM.
- If a task affects staffing, update the team or doula record if the platform supports it.
- Do not rely on memory for handoffs during launch week.

## Exception Handling

Use the following rules when the normal workflow breaks.

### Incomplete Intake Submission

- Keep the client in `lead` or `follow up`.
- Add a note listing the missing fields.
- Contact the client for clarification before contract or assignment work.

### Duplicate Lead Or Customer Record

- Confirm whether both records refer to the same person.
- Do not progress both records in parallel.
- Use one record as the source of truth and document the duplicate issue in notes.

### Status Does Not Match Reality

- Correct the status immediately.
- Add a note explaining why the status changed.

### Contract Sent With Incorrect Terms

- Stop follow-up on the incorrect version.
- Document the issue in the client notes.
- Regenerate and resend the corrected contract.

### Failed Or Missing Payment

- Review `Payments` and `Reconciliation`.
- Confirm whether the payment failed, is pending, or is missing from sync.
- Contact billing/admin owner the same day.
- Do not mark the client `active` based on assumption.

### Doula Assignment Conflict

- Document the conflict in the client notes.
- Remove or update the assignment as needed.
- Reassign only after confirming coverage and communication.

### System Or Integration Issue

- Capture screenshots and exact error text.
- Note the affected client, page, and time of issue.
- Continue the workflow manually if needed, but backfill the CRM once the issue is resolved.

## Launch Review Checklist

Complete this checklist before launch and again at the end of launch week.

- Contract templates are current and approved.
- Staff know when to use `Leads`, `Customers`, `Pipeline`, `Contracts`, `Payments`, `Reconciliation`, `Team`, and `Doulas`.
- All staff understand the required lifecycle statuses.
- Intake staff know the minimum record standard before handoff.
- Admins know where to document notes, assignments, and billing follow-up.
- Billing owners know how to review payment status and reconciliation results.
- Doula assignment owners know how to confirm documents and assignment roles.
- Team members have correct access and profile information.
- Exception paths are understood for incomplete intake, duplicate records, payment issues, and contract corrections.
- Launch-day ownership is clear for intake, contracts, billing, assignments, and support.

## Related References

- `CLIENT_MANAGEMENT_SYSTEM.md`
- `CONTRACT_AND_PAYMENT_INSTRUCTIONS.md`
- `QUICK_REFERENCE_GUIDE.md`
- `WORKFLOW_DIAGRAM.md`
