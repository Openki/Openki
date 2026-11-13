# The official garage image is FROM scratch (just the static binary, no
# shell), so garage-bootstrap.sh can't run there directly. This copies the
# binary into busybox to get a shell to run it in.
FROM busybox:1.38

COPY --from=dxflrs/garage:v2.5.0 /garage /garage
COPY garage-bootstrap.sh /garage-bootstrap.sh

ENTRYPOINT ["/bin/sh", "/garage-bootstrap.sh"]
