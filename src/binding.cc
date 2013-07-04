#include <node.h>
#include <node_buffer.h>

#include <stdlib.h>
#include <math.h>

extern "C" {
#include "base91.h"
}

using namespace node;
using namespace v8;

Handle<Value> B91Encode(const Arguments& args) {
  HandleScope scope;
  struct basE91 b91;
  Local<String> result;

  if (args.Length() < 1) {
    return ThrowException(Exception::TypeError(
      String::New("Missing data source (string or Buffer)")
    ));
  }

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
      result = String::New((const char*)obuf, ototal);
      free(obuf);
    } else
      result = String::Empty();
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
      result = String::New((const char*)obuf, ototal);
      free(obuf);
    } else
      result = String::Empty();
  } else {
    return ThrowException(Exception::TypeError(
      String::New("Data source not string or Buffer")
    ));
  }
  return scope.Close(result);
}

Handle<Value> B91Decode(const Arguments& args) {
  HandleScope scope;
  struct basE91 b91;
  Buffer *result = NULL;

  if (args.Length() < 1) {
    return ThrowException(Exception::TypeError(
      String::New("Missing string data source")
    ));
  }

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
  } else {
    return ThrowException(Exception::TypeError(
      String::New("Data source not string")
    ));
  }

  if (result != NULL)
    return scope.Close(result->handle_);
  else
    return scope.Close(Null());
}

extern "C" {
  void init(Handle<Object> target) {
    HandleScope scope;
    target->Set(String::NewSymbol("encode"),
                FunctionTemplate::New(B91Encode)->GetFunction());
    target->Set(String::NewSymbol("decode"),
                FunctionTemplate::New(B91Decode)->GetFunction());
  }

  NODE_MODULE(base91encdec, init);
}
