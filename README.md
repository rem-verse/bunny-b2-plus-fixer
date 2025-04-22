# Bunny B2 "+" Fixer #

This is a small middleware script that you can deploy on any Bunny.Net CDN
that is forwarding to a B2 source that has file names/folder names with '+' in
their names.

Currently as it stands Bunny.net trying to access a file name with a '+' in
it's name will result in "No such key" if the user doesn't manually encode it,
or "Invalid Signature" if the user manually encodes it to "%2B" before making
the request.

This means it is ***impossible*** to fetch from Backblaze with this special
character through Bunny.net _without_ this script. This script will cost more
as it runs in an edge script, but will allow the files to be fetched. This is
being used on many Bunny domains for rem-verse today to fix backups/mirrors
that need to proxy files with '+' in their names.

## Deploying Yourself ##

### Configuring Github Deployments ###

First we need to hook up GitHub to Bunny. You could do a one-off deploy, but
in general it's much easier to hook the two up. Unfortunately, GitHub actions
can't really run from forks, and we don't want you deploying to my account
anyway. So we'll be making a copy of this repository.

1. Create a new GitHub repo in whatever org you want your copy + deployment to live.
2. Download this repository, remove the `.git` folder if one is present, and point it at your new repo.
  - A blank GitHub repo should have instructions on how to push a codebase with existing code to your new repo.
3. Update your actions secrets: "BUNNY_SCRIPT_ID", and "BUNNY_DEPLOYMENT_SECRET".
4. Trigger a run of the action.

Congrats! Your Bunny script should now be deployed and hooked up to GitHub.

### Bunny <-> Backblaze ###

By the time we get the request Bunny has signed the request for us, but for the
path the user requested. As part of fixing '+' we may need to change the
path to fetch from in Backblaze. Unfortunately, Bunny just won't resign for us.
We need to do the signing ourselves in our middleware.

In order to do that our script itself performs signing to talk to your private
B2 Bucket, but _only when a plus is included_. In order to sign we need
access to the B2 Credentials in order to sign the request.

Since this middleware can be attached to multiple domains, and such at once
this script will look for the following environment variables in order to
resign properly:

- `${BUCKET_NAME_UPPERCASE_WITH_DASHES_REPLACED_WITH_UNDERSCORES}_B2_APPLICATION_KEY_ID`
- `${BUCKET_NAME_UPPERCASE_WITH_DASHES_REPLACED_WITH_UNDERSCORES}_B2_APPLICATION_KEY`

e.g. if your bucket was called: `nintendo-prod-cdn-pdx` you'd have the following
environment secrets configured in your script:

- `NINTENDO_PROD_CDN_PDX_B2_APPLICATION_KEY_ID`
- `NINTENDO_PROD_CDN_PDX_B2_APPLICATION_KEY`

You can repeat these secret creations for as many buckets as you want this
script to access. The B2 Application Keys only need to be read only, and don't
need to be able to list all the buckets or anything else.
