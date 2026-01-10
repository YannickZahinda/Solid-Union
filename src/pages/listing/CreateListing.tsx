import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PlusCircle,
  Upload,
  X,
  DollarSign,
  MapPin,
  Package,
  Home,
  Tag,
  Hash,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface ListingFormData {
  type: "product" | "property";
  category_id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  images: File[];
  imagePreviews: string[];

  // Product specific
  stock: string;
  negotiable: boolean;
  condition: string;
  tags: string[];

  // Property specific
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  furnished: boolean;
  property_type: string;
}

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<ListingFormData>({
    type: "product",
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
    images: [],
    imagePreviews: [],
    stock: "1",
    negotiable: false,
    condition: "new",
    tags: [],
    bedrooms: "1",
    bathrooms: "1",
    area_sqft: "",
    furnished: false,
    property_type: "apartment",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
      setProductCategories(data.filter((c) => c.type === "product"));
      setPropertyCategories(data.filter((c) => c.type === "property"));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...formData.images, ...files];
    const newPreviews = [...formData.imagePreviews];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newImages.length) {
          setFormData((prev) => ({
            ...prev,
            images: newImages,
            imagePreviews: newPreviews,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews,
    }));
  };

  const addTag = (tag: string) => {
    if (
      tag.trim() &&
      !formData.tags.includes(tag.trim()) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("listings").getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Prepare listing data
      const listingData: any = {
        user_id: user.id,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        images: imageUrls,
        tags: formData.tags,
      };

      // Add type-specific fields
      if (formData.type === "product") {
        listingData.stock = parseInt(formData.stock);
        listingData.negotiable = formData.negotiable;
        listingData.condition = formData.condition;

        const { error } = await supabase.from("products").insert([listingData]);

        if (error) throw error;
      } else {
        listingData.bedrooms = parseInt(formData.bedrooms);
        listingData.bathrooms = parseInt(formData.bathrooms);
        listingData.furnished = formData.furnished;
        listingData.property_type = formData.property_type;
        if (formData.area_sqft) {
          listingData.area_sqft = parseFloat(formData.area_sqft);
        }

        const { error } = await supabase
          .from("properties")
          .insert([listingData]);

        if (error) throw error;
      }

      toast({
        title: "Listing created!",
        description: "Your listing has been published successfully.",
      });

      navigate("/my-listings");
    } catch (error: any) {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Sell your products or properties to millions of potential buyers
          </p>
        </div>

        <Tabs
          defaultValue="product"
          className="w-full"
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              type: value as "product" | "property",
            }))
          }
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="product" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Product
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Property
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide essential details about your listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="What are you selling?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category_id: value }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.type === "product"
                          ? productCategories
                          : propertyCategories
                        ).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <span className="mr-2">{category.icon}</span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe your item in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Price *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="City, Country"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Type-specific Information */}
              <TabsContent value="product" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="1"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stock: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              condition: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                            <SelectItem value="refurbished">
                              Refurbished
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="negotiable"
                        checked={formData.negotiable}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            negotiable: checked,
                          }))
                        }
                      />
                      <Label htmlFor="negotiable">Price is negotiable</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="property" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          value={formData.bedrooms}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bedrooms: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          value={formData.bathrooms}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bathrooms: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area_sqft">Area (sq ft)</Label>
                        <Input
                          id="area_sqft"
                          type="number"
                          min="0"
                          value={formData.area_sqft}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              area_sqft: e.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Property Type</Label>
                      <RadioGroup
                        value={formData.property_type}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            property_type: value,
                          }))
                        }
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apartment" id="apartment" />
                          <Label htmlFor="apartment">Apartment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="house" id="house" />
                          <Label htmlFor="house">House</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="commercial" id="commercial" />
                          <Label htmlFor="commercial">Commercial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="land" id="land" />
                          <Label htmlFor="land">Land</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="furnished"
                        checked={formData.furnished}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            furnished: checked,
                          }))
                        }
                      />
                      <Label htmlFor="furnished">Furnished</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>
                    Upload up to 10 photos (first photo will be the main image)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formData.imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {formData.images.length < 10 && (
                        <label className="cursor-pointer">
                          <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              Add Photo
                            </span>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formData.images.length} / 10 photos uploaded
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </CardTitle>
                  <CardDescription>
                    Add tags to help buyers find your listing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <Hash className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        id="tagInput"
                        placeholder="Add a tag (e.g., electronics, furniture)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById(
                            "tagInput"
                          ) as HTMLInputElement;
                          addTag(input.value);
                          input.value = "";
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Press Enter or click Add to include tags. Maximum 10 tags.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Section */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-32"
                  disabled={
                    loading ||
                    !formData.title ||
                    !formData.category_id ||
                    !formData.price ||
                    !formData.location
                  }
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Publish Listing
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CreateListing;
