# Collaboration Workflow Implementation Guide

## Overview

This document describes the complete collaboration workflow for property sales between agents in the Bất Động Sản system.

## System Architecture

### Database Schema

- **properties** table:
  - `id`: Unique identifier
  - `status`: 'for-sale' or 'sold'
  - `agentid`: Owner/poster of the property

- **collaborations** table:
  - `id`: Unique identifier
  - `property_id`: Foreign key to properties
  - `agent_id`: Agent taking on sales
  - `status`: 'active', 'inactive', 'pending-confirmation', or 'sold'
  - `marked_as_sold_by`: Who marked as sold
  - `confirmed_as_sold_by`: Who confirmed the sale

## Complete Workflow

### Phase 1: Property Posting

1. **Agent A posts property**
   - Creates record in `properties` table with status='for-sale'
   - Property visible on Real Estate page

### Phase 2: Agent Takes On Sales

2. **Agent B sees property on Real Estate page and clicks "Nhận bán"**
   - Calls: `POST /api/v1/collaborations/accept`
   - Creates collaboration record with status='active'
   - Property NOW HIDDEN from Real Estate page
   - Property appears in Agent B's profile: "Bất động sản đang nhận bán" tab
   - Property appears in Agent A's profile: "Bất động sản được nhận bán" tab

### Phase 3: Marking as Sold

3. **Agent B marks property as "Đã bán" (Already sold)**
   - Calls: `POST /api/v1/collaborations/:id/mark-as-sold`
   - Collaboration status changes to 'pending-confirmation'
   - Property remains HIDDEN from Real Estate page
   - Property appears in Agent A's "Bất động sản được nhận bán" with pending-confirmation status
   - Agent A receives confirmation request

### Phase 4: Owner Confirmation or Rejection

Agent A has two choices:

#### Option 4a: Confirm Sale ✓

- Calls: `POST /api/v1/collaborations/:id/confirm-sold`
- Collaboration status changes to 'sold'
- **Property status changes to 'sold'** in properties table
- Property HIDDEN from Real Estate page
- Both agents see final 'sold' status

#### Option 4b: Reject/Cancel ✗

- Calls: `POST /api/v1/collaborations/:id/cancel`
- Collaboration status changes to 'inactive'
- **Property status remains 'for-sale'**
- Property VISIBLE again on Real Estate page
- Any agent (including C, D, etc.) can take on sales again

### Phase 5: Agent Cancels (Give Up Sale)

5. **Agent B cancels during active or pending-confirmation phase**
   - Calls: `POST /api/v1/collaborations/:id/cancel`
   - Collaboration status changes to 'inactive'
   - Property VISIBLE again on Real Estate page
   - Property removed from Agent B's "Bất động sản đang nhận bán" tab
   - Property removed from Agent A's "Bất động sản được nhận bán" tab

## API Endpoints

### Collaboration Endpoints

```
POST   /api/v1/collaborations/accept
       - Agent takes on property sales
       - Body: { propertyId: uuid }

POST   /:collaborationId/mark-as-sold
       - Selling agent marks as sold
       - Sends confirmation request to owner

POST   /:collaborationId/confirm-sold
       - Owner confirms the sale
       - Updates property status to 'sold'

POST   /:collaborationId/cancel
       - Either party cancels
       - Selling agent: always allowed
       - Owner: only when status='pending-confirmation'

GET    /my
       - Get all collaborations for current agent

GET    /my-properties
       - Get properties owned by current user with collaborations
```

### Property Endpoints

```
GET    /approved
       - Get all approved properties available for sale
       - EXCLUDES properties with active collaborations
       - EXCLUDES properties with status='sold'
```

## Key Implementation Details

### 1. Real Estate Page Filtering (findApproved)

When fetching approved properties:

1. Gets properties with `isactive=true`, `isapproved=true`
2. Applies status filter (default='for-sale')
3. **NEW**: Filters out properties that have active collaborations
4. Only properties available for new agents to take on sales are shown

### 2. Property Visibility Rules

A property is HIDDEN from Real Estate page when:

- ✓ It has an active collaboration (any agent taking on sales)
- ✓ Its status is 'sold'
- ✓ It's inactive (isactive=false)

A property is VISIBLE on Real Estate page when:

- ✓ It has no active collaborations
- ✓ Its status is 'for-sale'
- ✓ It's active and approved

### 3. Authorization Rules

#### Selling Agent (Agent B) can:

- Mark as sold (pending-confirmation)
- Cancel anytime (during active or pending-confirmation)

#### Property Owner (Agent A) can:

- Confirm/reject when status='pending-confirmation'
- Cannot take action during 'active' phase

#### Only One Active Collaboration per Property

- Database constraint: properties cannot have multiple active collaborations
- Agents cannot take on the same property twice
- When Agent C wants to take on sales, Agent B must cancel first

## Status Transitions

```
for-sale (property) + no collaboration (no collab)
    ↓
[Agent B clicks "Nhận bán"]
    ↓
for-sale (property) + active (collab)
    ├─ [Agent B marks "Đã bán"]
    │  ↓
    │  for-sale (property) + pending-confirmation (collab)
    │  ├─ [Agent A confirms]
    │  │  ↓
    │  │  sold (property) + sold (collab)  ✓ Final state
    │  │
    │  └─ [Agent A / B cancels]
    │     ↓
    │     for-sale (property) + inactive (collab) → Can be taken again
    │
    └─ [Agent B cancels]
       ↓
       for-sale (property) + inactive (collab) → Can be taken again
```

## Testing the Workflow

### Test Case 1: Complete Sale

1. Agent A posts property → visible on page
2. Agent B takes on sales → hidden from page
3. Agent B marks as sold → pending confirmation
4. Agent A confirms → property marked sold in DB
5. Property hidden from all pages

### Test Case 2: Agent Rejects

1. Agent A posts property → visible on page
2. Agent B takes on sales → hidden from page
3. Agent B marks as sold → pending confirmation
4. Agent A cancels → property visible again
5. Agent C can take on sales

### Test Case 3: Agent Gives Up

1. Agent A posts property → visible on page
2. Agent B takes on sales → hidden from page
3. Agent B cancels → property visible again
4. Any agent can take on sales

## Performance Notes

The findApproved implementation:

- Fetches properties with pagination from DB
- For each page, checks active collaborations
- Filters out properties with active collaborations
- Returns adjusted count

This approach works well because:

- Number of active collaborations is typically small
- Query is efficient (uses 'in' operator)
- User gets the correct filtered results

Potential future optimization:

- Use database-level filtering with JOIN on collaborations
- Requires more complex SQL query against Supabase

## Troubleshooting

### Property not showing on Real Estate page

Check:

1. Property has `status='for-sale'`
2. Property has `isactive=true`
3. Property has `isapproved=true`
4. No active collaborations exist for this property

### Agent can't mark as sold

Check:

1. Collaboration status is 'active'
2. Agent is the selling agent (collaboration.agent_id)
3. Property exists and is valid

### Owner can't confirm sale

Check:

1. Collaboration status is 'pending-confirmation'
2. Owner is the property owner (property.agentid)
3. Collaboration exists

## Notes

- Properties never truly "deleted", only status='sold' or isactive=false
- Inactive collaborations don't affect property visibility
- Multiple agents can want the property, but only one can actively take it
- Status 'pending-confirmation' ensures transparency in the workflow
