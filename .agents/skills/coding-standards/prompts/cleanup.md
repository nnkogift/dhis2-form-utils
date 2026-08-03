# Cleanup prompts

This contains reference of changes I've made to the skills to keep track of them.

# Feature Modules

For NextJS 16 and above apps we instead need to use the underscore convention for reusable modules which map to routes.
Each route can have a `_shared` folder for shared components, hooks, utils, schemas, and types. These can be as nested
as the routes. A component should be as close as to the route it is used in. Don't overbloat the top level `_shared`
folder. If there are components used across multiple routes, create a shared folder at the src level, with the same
composition.

For other React apps and DHIS2 web apps, we use the same convention, but with a modules folder instead of Next's shared.

- [x] Implemented

# DHIS2 development

dhis2.md
Refactor this reference to refer to https://www.skills.sh/devotta-labs/dhis2-app-skills/dhis2-app-development instead,
The app structure should always come from DHIS2 app platform bootstrapping

- [x] Implemented
