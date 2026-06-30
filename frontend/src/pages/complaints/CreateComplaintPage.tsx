import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FilePlus,
  Paperclip,
  AlertCircle,
  Send,
  Info,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { createComplaint } from "../../services/complaintService";
import {
  BACKEND_CATEGORIES,
  mapCreateFormToRequest,
} from "../../mappers/complaintMapper";

interface ComplaintForm {
  title: string;
  category: string;
  description: string;
  department: string;
  isAnonymous: boolean;
}

export function CreateComplaintPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintForm>({
    defaultValues: {
      category: "ACADEMIC",
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: ComplaintForm) => {
    setSubmitting(true);
    try {
      const payload = mapCreateFormToRequest({
        title: data.title,
        description: data.description,
        category: data.category,
        department: data.department,
        isAnonymous: data.isAnonymous,
      });
      const complaint = await createComplaint(payload);
      toast.success(`Complaint ${complaint.complaint_code} submitted successfully`);
      navigate(`/complaints/${complaint.complaint_id}`);
    } catch {
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Create a Complaint"
        description="Submit a new grievance, complaint, or wellbeing request."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "My Complaints", href: "/complaints" },
          { label: "New Complaint" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Complaint Details</CardTitle>
              </CardHeader>
              <div className="space-y-5">
                <Input
                  label="Title"
                  placeholder="Briefly describe the issue..."
                  error={errors.title?.message}
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 10, message: "Title must be at least 10 characters" },
                    maxLength: { value: 120, message: "Title must be less than 120 characters" },
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    error={errors.category?.message}
                    {...register("category", { required: true })}
                  >
                    {BACKEND_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Priority
                    </label>
                    <div className="h-10 flex items-center px-3 text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg">
                      Assigned automatically by AI
                    </div>
                  </div>
                </div>

                <Input
                  label="Department"
                  placeholder="e.g., Computer Science"
                  error={errors.department?.message}
                  {...register("department", { required: "Department is required" })}
                />

                <Textarea
                  label="Description"
                  placeholder="Provide a detailed description of the issue. Include relevant dates, names, and any context that will help investigators understand the situation."
                  rows={8}
                  error={errors.description?.message}
                  hint="Be as specific as possible. This helps our team investigate and resolve your complaint faster."
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 50, message: "Please provide at least 50 characters" },
                  })}
                />

                <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    {...register("isAnonymous")}
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Submit anonymously
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Your identity will be hidden from staff reviewing this complaint.
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Attachments (optional)
                  </label>
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-400 border border-dashed border-neutral-200 rounded-lg w-full justify-center cursor-not-allowed"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach a file — Coming Soon
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/complaints")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  icon={!submitting ? <Send className="w-4 h-4" /> : undefined}
                >
                  Submit Complaint
                </Button>
              </div>
            </Card>
          </form>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Before You Submit</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  Provide a clear, factual description of the issue. Avoid emotional
                  language and focus on specific events.
                </p>
              </div>
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  Include relevant dates, locations, and names of individuals
                  involved where applicable.
                </p>
              </div>
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  Attach any supporting documents, screenshots, or evidence that
                  can help with the investigation.
                </p>
              </div>
              <div className="flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
                <p>
                  For urgent safety concerns, contact campus security directly in
                  addition to filing this complaint.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-primary-50/50 border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <FilePlus className="w-4 h-4 text-primary-700" />
              <h3 className="text-sm font-semibold text-primary-900">
                What happens next?
              </h3>
            </div>
            <ol className="space-y-2.5 text-sm text-neutral-600">
              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold shrink-0">
                  1
                </span>
                <span>Your complaint is reviewed and assigned within 24 hours.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold shrink-0">
                  2
                </span>
                <span>A staff member investigates and may contact you for details.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold shrink-0">
                  3
                </span>
                <span>You'll receive notifications at each status change.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold shrink-0">
                  4
                </span>
                <span>Once resolved, you can review and close the complaint.</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
