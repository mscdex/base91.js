#include <node.h>
#include <node_buffer.h>
#include <nan.h>

#include <stdlib.h>
#include <math.h>

extern "C" {
#include "base91.h"
}

using namespace node;
using namespace v8;

NAN_METHOD(B91Encode) {
  NanScope();
  struct basE91 b91;
  Local<String> result;

  if (args.Length() < 1)
    return NanThrowTypeError("Missing data source (string or Buffer)");

  if (args[0]->IsString()) {
    String::Utf8Value data(args[0]);
    size_t datalen = data.length();
    if (datalen > 0) {
      char* obuf = (char*)malloc(floor(1.25 * datalen));
      basE91_init(&b91);
      int ototal = 0;
      char* ibuf = *data;
      ototal += basE91_encode(&b91, ibuf, datalen, obuf);
      ototal += basE91_encode_end(&b91, obuf + ototal);
      result = NanNew<String>((const char*)obuf, ototal);
      free(obuf);
    } else
      result = NanNew<String>();
  } else if (Buffer::HasInstance(args[0])) {
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 10
    Local<Object> buf = args[0]->ToObject();
#else
    Local<Value> buf = args[0];
#endif
    char* data = Buffer::Data(buf);
    size_t datalen = Buffer::Length(buf);

    if (datalen > 0) {
      char* obuf = (char*)malloc(floor(1.25 * datalen));
      basE91_init(&b91);
      int ototal = 0;
      ototal += basE91_encode(&b91, data, datalen, obuf);
      ototal += basE91_encode_end(&b91, obuf + ototal);
      result = NanNew<String>((const char*)obuf, ototal);
      free(obuf);
    } else
      result = NanNew<String>();
  } else
    return NanThrowTypeError("Data source not string or Buffer");

  NanReturnValue(result);
}

NAN_METHOD(B91Decode) {
  NanScope();
  struct basE91 b91;
  Buffer *result = NULL;

  if (args.Length() < 1)
    return NanThrowTypeError("Missing string data source");

  if (args[0]->IsString()) {
    String::Utf8Value data(args[0]);
    size_t datalen = data.length();
    if (datalen > 0) {
      char* obuf = (char*)malloc(datalen);
      basE91_init(&b91);
      size_t ototal = 0;
      ototal += basE91_decode(&b91, *data, datalen, obuf);
      ototal += basE91_decode_end(&b91, obuf + ototal);
      result = Buffer::New((const char*)obuf, ototal);
      free(obuf);
    }
  } else
    return NanThrowTypeError("Data source not string");

  if (result != NULL)
    NanReturnValue(result->handle_);
  else
    NanReturnValue(NanNull());
}

extern "C" {
  void init(Handle<Object> target) {
    NanScope();
    target->Set(NanNew<String>("encode"),
                NanNew<FunctionTemplate>(B91Encode)->GetFunction());
    target->Set(NanNew<String>("decode"),
                NanNew<FunctionTemplate>(B91Decode)->GetFunction());
  }

  NODE_MODULE(base91encdec, init);
}
