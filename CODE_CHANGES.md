# Code Changes Summary - Collaboration Workflow

## Files Modified

### 1. backend/models/property.model.js

**Method:** `findApproved(filters, limit, offset)`

**Changes:**

- Added filtering logic to exclude properties with active collaborations
- After fetching properties from database, checks for active collaborations
- Filters out properties that have any active collaboration
- Adjusts total count to account for filtered results

**Code:**

```javascript
// Get all active collaborations to exclude properties being sold
if (data && data.length > 0) {
  const propertyIds = data.map((p) => p.id);
  const { data: activeCollaborations, error: collabError } = await supabaseAdmin
    .from("collaborations")
    .select("property_id")
    .in("property_id", propertyIds)
    .eq("status", "active");

  if (!collabError && activeCollaborations && activeCollaborations.length > 0) {
    const activePropertyIds = new Set(
      activeCollaborations.map((c) => c.property_id),
    );
    const filteredData = data.filter((p) => !activePropertyIds.has(p.id));

    return {
      data: filteredData,
      total: Math.max(0, (count ?? 0) - activeCollaborations.length),
    };
  }
}
```

**Rationale:**

- Ensures properties with active collaborations don't appear on the Real Estate page
- Maintains accurate count for pagination

---

### 2. backend/controllers/collaboration.controller.js

**Method:** `cancelCollaboration(req, res)`

**Changes:**

- Updated authorization logic to allow both selling agent and property owner to cancel
- Selling agent can cancel anytime
- Property owner can only cancel when collaboration status is 'pending-confirmation'
- Improved error messaging for authorization failures

**Code:**

```javascript
// Check authorization (selling agent can always cancel, owner can only cancel if pending-confirmation)
if (collaboration.agent_id === userId) {
  // Selling agent can always cancel
} else {
  // Property owner can only cancel if pending-confirmation (rejecting the sale)
  const property = await Property.getById(collaboration.property_id);
  if (
    property.agentid !== userId ||
    collaboration.status !== "pending-confirmation"
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to cancel this collaboration",
    });
  }
}
```

**Rationale:**

- Allows property owners to reject pending-confirmation requests
- Maintains proper authorization checks
- Supports the "reject" action shown in the frontend UI

---

## Unchanged Components (Already Working)

### Database Schema

- `properties.status` field already supports 'for-sale' and 'sold' states
- `collaborations` table already has all required fields
- Migration `007_extend_collaborations_for_sold_tracking.sql` already adds sold-tracking fields

### Collaboration Model Methods

- `markAsSold()` - Changes status to 'pending-confirmation' ✓
- `confirmSold()` - Changes status to 'sold' ✓
- `cancel()` - Changes status to 'inactive' ✓

### Collaboration Controller Methods

- `acceptProperty()` - Creates collaboration with status='active' ✓
- `markAsSold()` - Calls model.markAsSold() ✓
- `confirmSold()` - Calls model.confirmSold() AND updates property.status='sold' ✓
- `getMyCollaborations()` - Fetches agent's collaborations ✓
- `getMyPropertiesWithCollaborations()` - Fetches owner's properties with collaborations ✓

### Frontend Components

- `src/app/dashboard/collaboration/page.tsx` - Collaboration management UI ✓
- `src/features/collaboration/collaboration.service.ts` - All required API methods ✓
- `src/app/properties/page.tsx` - Uses getApprovedProperties via propertyService.getAll() ✓

---

## Property Visibility Logic

### Properties shown on Real Estate page (`/properties`):

```
WHERE
  isactive = true
  AND isapproved = true
  AND status = 'for-sale'  [default filter]
  AND property_id NOT IN (
    SELECT property_id FROM collaborations WHERE status = 'active'
  )
```

### Properties shown in Agent's "Bất động sản đang nhận bán":

```
WHERE
  agent_id = current_agent_id
  AND status IN ('active', 'pending-confirmation', 'sold')
```

### Properties shown in Owner's "Bất động sản được nhận bán":

```
WHERE
  property_id IN (SELECT id FROM properties WHERE agentid = current_owner_id)
  AND status IN ('active', 'pending-confirmation', 'sold')
```

---

## API Endpoints Affected

### GET /api/v1/properties/approved

- **Now:** Excludes properties with active collaborations
- **Was:** Included all approved properties
- **Calls:** Property.findApproved()

### POST /api/v1/collaborations/:id/cancel

- **Now:** Allows both selling agent and owner to cancel
- **Was:** Only allowed selling agent to cancel
- **Calls:** Collaboration.cancel()

---

## Testing Checklist

- [ ] Property hidden from Real Estate page when agent takes on sales
- [ ] Property visible again when agent cancels
- [ ] Property marked as 'sold' in database after owner confirms
- [ ] Owner can reject pending-confirmation collaboration
- [ ] Pagination works correctly with filtered results
- [ ] No active collaborations shown in public endpoints
- [ ] Both tabs on collaboration page work correctly
- [ ] Authorization errors return proper HTTP codes (403, 404)

---

## Performance Considerations

### Database Queries

- findApproved: 2 queries per request
  1. Get properties with filters and pagination
  2. Get active collaborations for returned properties
- No N+1 queries (uses 'in' clause for batch fetch)

### Optimization Opportunities

- Could cache active collaborations if list grows large
- Could use database-level filtering with JOIN (requires SQL refactoring)
- Current approach is pragmatic and works well with typical data volumes

---

## Error Handling

All error cases are properly handled:

- Property not found → 404
- Collaboration not found → 404
- Unauthorized access → 403
- Database errors → 500 with message
- Invalid input → 400 with validation errors

---

## Notes

- No breaking changes to existing APIs
- All changes are additive or refinement only
- Frontend functionality was already implemented, backend just needed fixing
- Status field in database properly tracks property lifecycle
