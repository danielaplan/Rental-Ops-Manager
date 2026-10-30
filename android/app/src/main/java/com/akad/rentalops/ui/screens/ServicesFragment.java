package com.akad.rentalops.ui.screens;

import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import com.akad.rentalops.R;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Images;
import com.akad.rentalops.util.Js;
import org.json.JSONObject;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Service editor with public-card image upload. */
public class ServicesFragment extends ListScreen {
    private static final long MAX_IMAGE_BYTES=5L*1024L*1024L;
    private static final Set<String> IMAGE_TYPES=new HashSet<>(Arrays.asList("image/jpeg","image/png","image/gif","image/webp"));
    private Uri selectedImage;
    private ImageView activePreview;
    private TextView activeStatus,activeError;
    private final ActivityResultLauncher<String> imagePicker=registerForActivityResult(new ActivityResultContracts.GetContent(),uri->{
        if(uri==null||activePreview==null)return;
        String error=validateImage(uri); if(error!=null){showError(error);return;}
        selectedImage=uri; activePreview.setImageURI(uri); activePreview.setVisibility(View.VISIBLE);
        activeStatus.setText("New image selected. It will upload when you save."); activeError.setVisibility(View.GONE);
    });

    @Override protected void load(Api.Callback cb){Api.get("services.php",Api.q("do","all"),cb);}
    @Override protected RowAdapter.Row toRow(JSONObject o){return new RowAdapter.Row(o).title(Js.s(o,"service_name")).subtitle(Js.s(o,"description")).detail("Prep "+Js.i(o,"default_preparation_minutes")+" min · Travel "+Js.i(o,"default_travel_minutes")+" min").badge(Js.s(o,"status"));}
    @Override protected boolean canAdd(){return true;}
    @Override protected void onAdd(){edit(null);}
    @Override protected void onRowClick(RowAdapter.Row row){edit(row.raw);}

    private void edit(final JSONObject item){
        selectedImage=null;
        View root=LayoutInflater.from(requireContext()).inflate(R.layout.dialog_service,null);
        EditText name=root.findViewById(R.id.serviceNameInput),description=root.findViewById(R.id.serviceDescriptionInput),preparation=root.findViewById(R.id.servicePreparationInput),travel=root.findViewById(R.id.serviceTravelInput);
        Spinner status=root.findViewById(R.id.serviceStatusInput);
        activePreview=root.findViewById(R.id.serviceImagePreview); activeStatus=root.findViewById(R.id.serviceImageStatus); activeError=root.findViewById(R.id.serviceFormError);
        status.setAdapter(new ArrayAdapter<>(requireContext(),android.R.layout.simple_spinner_dropdown_item,new String[]{"Active","Inactive"}));
        if(item!=null){
            name.setText(Js.s(item,"service_name")); description.setText(Js.s(item,"description")); preparation.setText(String.valueOf(Js.i(item,"default_preparation_minutes"))); travel.setText(String.valueOf(Js.i(item,"default_travel_minutes"))); status.setSelection("Inactive".equals(Js.s(item,"status"))?1:0);
            if(!Js.s(item,"image").isEmpty()){Images.load(activePreview,Js.s(item,"image"));activePreview.setVisibility(View.VISIBLE);activeStatus.setText("Current website image. Choose another only to replace it.");}
        }else{preparation.setText("0");travel.setText("0");}
        root.findViewById(R.id.serviceChooseImage).setOnClickListener(v->imagePicker.launch("image/*"));
        AlertDialog.Builder builder=new AlertDialog.Builder(requireContext()).setTitle(item==null?"Add Service":"Edit Service").setView(root).setPositiveButton(R.string.save,null).setNegativeButton(R.string.cancel,null);
        if(item!=null)builder.setNeutralButton(R.string.delete,null);
        AlertDialog dialog=builder.create();
        dialog.setOnShowListener(ignored->{
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
                String serviceName=name.getText().toString().trim(),serviceDescription=description.getText().toString().trim();
                if(serviceName.isEmpty()||serviceDescription.isEmpty()){showError("Enter the service name and description.");return;}
                int prep,trip; try{prep=Integer.parseInt(preparation.getText().toString());trip=Integer.parseInt(travel.getText().toString());}catch(Exception ex){showError("Allowances must be whole minutes.");return;}
                if(prep<0||trip<0){showError("Allowances cannot be negative.");return;} setSaving(dialog,true);
                if(selectedImage!=null)Api.uploadServiceImage(requireContext().getContentResolver(),selectedImage,new Api.Callback(){
                    @Override public void onSuccess(Object data){save(item,serviceName,serviceDescription,prep,trip,status.getSelectedItem().toString(),String.valueOf(data),dialog);}
                    @Override public void onError(String m,String c,int s){setSaving(dialog,false);showError(m);}
                }); else save(item,serviceName,serviceDescription,prep,trip,status.getSelectedItem().toString(),item==null?"":Js.s(item,"image"),dialog);
            });
            if(item!=null)dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener(v->{dialog.dismiss();FormUi.confirm(requireContext(),"Delete this service? This cannot be undone.",()->Api.delete("services.php",Js.s(item,"service_id"),new Api.Callback(){@Override public void onSuccess(Object d){if(alive()){toast("Deleted.");reload();}}@Override public void onError(String m,String c,int s){toast(m);}}));});
        });
        dialog.setOnDismissListener(ignored->{selectedImage=null;activePreview=null;activeStatus=null;activeError=null;}); dialog.show();
    }

    private void save(JSONObject item,String name,String description,int prep,int travel,String status,String image,AlertDialog dialog){
        JSONObject values=Js.of("service_name",name,"description",description,"default_preparation_minutes",prep,"default_travel_minutes",travel,"status",status,"image",image);
        Api.Callback cb=new Api.Callback(){@Override public void onSuccess(Object d){if(alive()){dialog.dismiss();saved();reload();}}@Override public void onError(String m,String c,int s){setSaving(dialog,false);showError(m);}};
        if(item==null)Api.create("services.php",values,cb);else Api.update("services.php",Js.s(item,"service_id"),values,cb);
    }
    private String validateImage(Uri uri){String mime=requireContext().getContentResolver().getType(uri);if(!IMAGE_TYPES.contains(mime))return "Choose a JPG, PNG, GIF, or WebP image.";long size=-1;try(Cursor cursor=requireContext().getContentResolver().query(uri,new String[]{OpenableColumns.SIZE},null,null,null)){if(cursor!=null&&cursor.moveToFirst()&&!cursor.isNull(0))size=cursor.getLong(0);}catch(Exception ignored){}return size==0||size>MAX_IMAGE_BYTES?"Choose an image no larger than 5 MB.":null;}
    private void setSaving(AlertDialog d,boolean saving){d.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(!saving);d.getButton(AlertDialog.BUTTON_NEGATIVE).setEnabled(!saving);if(d.getButton(AlertDialog.BUTTON_NEUTRAL)!=null)d.getButton(AlertDialog.BUTTON_NEUTRAL).setEnabled(!saving);}
    private void showError(String message){if(activeError!=null){activeError.setText(message);activeError.setVisibility(View.VISIBLE);}}
}
