rm -rf .output;
nuxt generate;
rm -rf dist;
cp -r .output/public dist;
