# QA / bug-reduction plan

## Merge gates
- JavaScript syntax check passes.
- Core unit tests pass.
- Static site loads without console errors.
- Search exact-match fixtures pass.
- Offer ranking tests pass.
- No demo record is labelled verified.
- No API secret is committed.

## Identification test matrix
For every supported reference product test:
- exact model number
- normalized model number without spaces/hyphens
- barcode where available
- misspelled/partial text
- ambiguous text
- unsupported product

## Compatibility test matrix
For every production part mapping:
- expected compatible product
- at least one known incompatible neighboring model
- evidence source present
- source retrieval date present
- safety class correct

## iPhone acceptance test
- Safari HTTPS page loads
- camera permission prompt appears
- manual lookup always works
- Add to Home Screen works
- offline shell loads after first successful visit
- back navigation works
- saved devices persist

## v0.7 regression targets

- Guided issue flows may only link to parts that exist on the same product fixture.
- Evidence grades must be A, B or C and never replace the underlying confidence value.
- Device-passport data stays local and is removed by demo reset.
- Share must fall back to copying the current URL when Web Share is unavailable.
- "Fastest" ranking sorts by delivery days and does not change the recommendation score.
- Sponsored status must not affect recommendation score.
