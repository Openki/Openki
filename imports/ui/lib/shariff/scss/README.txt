Less source converted from shariff v1.26.2 using the following workflow:

Install: https://www.npmjs.com/package/less-scss-convertor

# Convert less to (broken) scss files:
find src/style -name '*.less' | xargs -n1 less-scss-convertor

# Fixup
find . -name '*.scss' | xargs sed -i.bkp 's#$import#@import#g'
find . -name '*.scss' | xargs sed -i.bkp 's#@extend#@include#g'
